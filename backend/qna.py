import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.utilities import SQLDatabase
from typing import TypedDict, Annotated
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from langchain import hub
from typing_extensions import Annotated
from langchain_community.tools.sql_database.tool import QuerySQLDatabaseTool


load_dotenv()
app = Flask(__name__)
CORS(app)  

# Environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DB_URI = 'sqlite:///Students.db'

db = SQLDatabase.from_uri(DB_URI)

# Initialize LLM
llm = init_chat_model("llama3-8b-8192", model_provider="groq")

# Define state structure
class State(TypedDict):
    question: str
    query: str
    result: str
    answer: str


query_prompt_template = hub.pull("langchain-ai/sql-query-system-prompt")



class QueryOutput(TypedDict):
    """Generated SQL query."""

    query: Annotated[str, ..., "Syntactically valid SQL query."]


def write_query(state: State):
    """Generate SQL query to fetch information."""
    prompt = query_prompt_template.invoke(
        {
            "dialect": db.dialect,
            "top_k": 10,
            "table_info": db.get_table_info(),
            "input": state["question"],
        }
    )
    structured_llm = llm.with_structured_output(QueryOutput)
    result = structured_llm.invoke(prompt)
    return {"query": result["query"]}




def execute_query(state: State):
    """Execute SQL query."""
    execute_query_tool = QuerySQLDatabaseTool(db=db)
    return {"result": execute_query_tool.invoke(state["query"])}

def generate_answer(state: State):
    """Answer question using retrieved information as context."""
    prompt = (
        "Given the following user question, corresponding SQL query, "
        "and SQL result, answer the user question.\n\n"
        f'Question: {state["question"]}\n'
        f'SQL Query: {state["query"]}\n'
        f'SQL Result: {state["result"]}'
    )
    response = llm.invoke(prompt)
    return {"answer": response.content}

def final_answer(question):
  ques = {"question": [question]}
  q = write_query(ques)
  # print(q)
  result = execute_query(q)

  answer = generate_answer({'question' : ques["question"] , 'query' : q['query'] , 'result' : result['result']})
  return answer['answer'] 

@app.route('/query', methods=['POST'])
def query():
    data = request.json
    if not data or 'question' not in data:
        return jsonify({"error": "No question provided"}), 400
    
    question = data['question']
    
    try:
        response = final_answer(question)
        
        return jsonify({
            "question": question,
            "answer": response
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
