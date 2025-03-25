from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta
import pytz
import os
import smtplib
from email.mime.text import MIMEText
import threading
import time

app = Flask(__name__, static_folder='build', static_url_path='')
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reminders.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Email configuration
#app.config['MAIL_SENDER'] = "cse230001050@iiti.ac.in"  # Your email
#app.config['MAIL_PASSWORD'] = "nqiesvbbvkxqytjm"  # Your app password

# Initialize database
db = SQLAlchemy(app)

# Define Reminder model
class Reminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(100), nullable=False)
    event_name = db.Column(db.String(100), nullable=False)
    event_datetime = db.Column(db.DateTime, nullable=False)
    reminder_datetime = db.Column(db.DateTime, nullable=False)
    sent = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_email': self.user_email,
            'event_name': self.event_name,
            'event_datetime': self.event_datetime.isoformat(),
            'reminder_datetime': self.reminder_datetime.isoformat(),
            'sent': self.sent
        }

def get_indian_time():
    """Get current date and time in Indian timezone (IST)"""
    return datetime.now(pytz.timezone('Asia/Kolkata'))

def send_reminder_email(recipient_email, event_datetime, event_name):
    """Sends a reminder email to the specified recipient."""
    event_date_str = event_datetime.strftime("%A, %B %d, %Y at %I:%M %p")
    subject = f"Reminder: {event_name}"
    message = f"""
Hello,

This is a friendly reminder that you have "{event_name}" scheduled for {event_date_str}.

Don't forget!

Best regards,
Your Reminder Service
"""
    msg = MIMEText(message)
    msg['Subject'], msg['From'], msg['To'] = subject, app.config['MAIL_SENDER'], recipient_email

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(app.config['MAIL_SENDER'], app.config['MAIL_PASSWORD'])
            server.sendmail(app.config['MAIL_SENDER'], recipient_email, msg.as_string())
        print(f"Reminder email sent to {recipient_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def check_reminders():
    """Check for reminders that need to be sent"""
    with app.app_context():
        current_time = get_indian_time()
        reminders = Reminder.query.filter(
            Reminder.sent == False,
            Reminder.reminder_datetime <= current_time
        ).all()
        
        for reminder in reminders:
            print(f"Sending reminder for {reminder.event_name}...")
            if send_reminder_email(reminder.user_email, reminder.event_datetime, reminder.event_name):
                reminder.sent = True
                db.session.commit()

def reminder_checker():
    """Function to continuously check reminders"""
    while True:
        check_reminders()
        time.sleep(60)  # Check every minute

# API Routes
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/reminders', methods=['GET'])
def get_reminders():
    reminders = Reminder.query.all()
    return jsonify([reminder.to_dict() for reminder in reminders])

@app.route('/api/reminders', methods=['POST'])
def add_reminder():
    data = request.json
    
    try:
        # Parse the UTC datetime string
        event_datetime_str = data['event_datetime'].replace('Z', '')  # Remove 'Z' (if any)
        utc_datetime = datetime.fromisoformat(event_datetime_str).replace(tzinfo=pytz.utc)  # Assign UTC timezone

        # Convert to IST
        ist_timezone = pytz.timezone('Asia/Kolkata')
        event_datetime = utc_datetime.astimezone(ist_timezone)
        
        # Calculate reminder time
        hours_before = int(data.get('hours_before', 1))
        minutes_before = int(data.get('minutes_before', 0))
        total_minutes = (hours_before * 60) + minutes_before
        reminder_datetime = event_datetime - timedelta(minutes=total_minutes)
        
        # Check if dates are valid
        current_time = get_indian_time()
        if event_datetime <= current_time:
            return jsonify({'status': 'error', 'message': 'Event date has already passed.'}), 400
        elif reminder_datetime <= current_time:
            return jsonify({'status': 'error', 'message': 'Reminder time has already passed.'}), 400
        
        # Create the reminder
        reminder = Reminder(
            user_email=data['user_email'],
            event_name=data['event_name'],
            event_datetime=event_datetime,
            reminder_datetime=reminder_datetime,
            sent=False
        )
        
        db.session.add(reminder)
        db.session.commit()
        
        return jsonify({
            'status': 'success', 
            'message': 'Reminder added successfully',
            'reminder': reminder.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/reminders/<int:reminder_id>', methods=['DELETE'])
def delete_reminder(reminder_id):
    reminder = Reminder.query.get_or_404(reminder_id)
    db.session.delete(reminder)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Reminder deleted successfully'})

@app.route('/api/current-time', methods=['GET'])
def get_current_time():
    current_time = get_indian_time()
    return jsonify({'current_time': current_time.isoformat()})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
    # Start the reminder checker in a background thread
    checker_thread = threading.Thread(target=reminder_checker, daemon=True)
    checker_thread.start()
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
