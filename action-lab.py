import cgi
import datetime
import hashlib
import hmac
import jinja2
import os
import logging
import re
import time
import webapp2
from google.appengine.ext import db

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'])
	
values  = {"first_name": "",
		"last_name": "",
		"dob": "",
		"sex": "",
		"first_name_error": "",
		"last_name_error": "",
		"dob_error": "",
		"sex_error": "",
		"message": ""}
SECRET = "supersupersalty"
ADMIN_PASS = "action_lab2017"

class Feedback(db.Model):
	name = db.StringProperty()
	created = db.DateTimeProperty()
	feedback = db.TextProperty()

class User(db.Model):
	first_name = db.StringProperty()
	last_name = db.StringProperty()
	dob = db.StringProperty()
	sex = db.StringProperty()
	game1 = db.IntegerProperty()
	game2 = db.IntegerProperty()
	game3 = db.IntegerProperty()
	game4 = db.IntegerProperty()

#Checks if user is an admin
def check_admin(admin):
	if admin == return_hash(ADMIN_PASS):
		return True
	return False

#Checks if user is signed in to play games
def check_user(this_user):
	try: 
		if User.get_by_id(int(this_user.split('|')[0])) and (return_hash(this_user.split('|')[0]) == this_user.split('|')[1]):
			return True
		else:
			return False
	except:
		return False

#Escapes html in forms
def escape_html(s):
    return cgi.escape(s, quote = True)

#Encrypt
def return_hash(s):
	return hmac.new(SECRET,s).hexdigest()

#Update global values dictionary
def update_values(first_name="",last_name="",dob="",sex="",first_name_error="",last_name_error="",dob_error="",sex_error="",message=""):
	logging.info("**** UPDATE VALUES ****")
	global values
	values['first_name'] = first_name
	values['last_name'] = last_name
	values['dob'] = dob
	values['sex'] = sex
	values['first_name_error'] = first_name_error
	values['last_name_error'] = last_name_error
	values['dob_error'] = dob_error
	values['sex_error'] = sex_error
	values['message'] = message
	
#Checks if user is in database
def valid_user(first_name,last_name,dob,sex):
	global values
	this_user = db.GqlQuery("SELECT * FROM User WHERE first_name = '%s' AND last_name = '%s'" % (first_name,last_name)).get()
	try:
		if not this_user:
			values['first_name_error'] = "Name not in database. Input name with capital first letter (e.g. Xxxxxx)"
		if this_user.dob != return_hash(dob):
			values['dob_error'] = "Birthday doesn't match database. Input birthday with month, day, and year split by '/' (e.g. MM/DD/YYYY)"
		if this_user.sex != return_hash(sex):
			values['sex_error'] = "Sex doesn't match database. Input first character of sex (e.g. 'M'/'F')"
		else :
			update_values()
			return this_user.key().id()
		return 0
	except:
		values['message'] = "You must enter a value for every field."
		return 0

#Checks if user can be entered in database
def valid_user_entry(first_name,last_name,dob,sex):
	is_valid = True
	update_values(first_name=first_name,last_name=last_name,dob=dob,sex=sex)
	global values
	if not re.compile(r'^[A-Z][a-z]+$').match(values['first_name']):
		is_valid = False
		values['first_name_error'] = "First name must be only lowercase letters except for first letter. Do not include spaces or punctuation. (e.g. Xxxxxx)"
	if not re.compile(r'^[A-Z][a-z]+$').match(values['last_name']):
		is_valid = False
		values['message'] = ""
		values['last_name_error'] = "Last name must be only lowercase letters except for first letter. Do not include spaces or punctuation. (e.g. Xxxxxx)"
	if not re.compile(r'^([0][1-9]|[1][0-2])\/([0][1-9]|[1-2][\d]|[3][0-1])\/(199[8-9]|20(0[\d]|1[0-1]))$').match(values['dob']):
		is_valid = False
		values['message'] = ""
		values['dob_error'] = "Date of birth must follow format  MM/DD/YYYY and user must be between the ages of 6 and 18."
	if not re.compile(r'^(M|F|NB)$').match(values['sex']):
		is_valid = False
		values['message'] = ""
		values['sex_error'] = "Sex should match 'M', 'F', or 'NB'"
	return is_valid

#About the Action Lab
class About(webapp2.RequestHandler):
	def get(self):
		logging.info("**** About Get ****")
		template = JINJA_ENVIRONMENT.get_template('templates/about.html')
		self.response.write(template.render(title="About", user=self.request.cookies.get("user"), admin=self.request.cookies.get("admin")))
	
#Admin can add a new user	
class AddUser(webapp2.RequestHandler):
	def get(self):
		logging.info("**** AddUser Get ****")
		update_values()
		if not check_admin(self.request.cookies.get('admin')):
			self.response.headers.add_header('Set-Cookie', 'error="You are not authorized to view this page. Please login as an admin."; Path=/')
			self.response.headers.add_header('Set-Cookie', 'admin=""; Expires=%s' % (datetime.datetime.now() + datetime.timedelta(-1)))
			self.redirect('/error')
		self.write_form(**values)
	
	def post(self):
		logging.info("**** AddUser Post ****")
		
		if not check_admin(self.request.cookies.get('admin')):
			self.response.headers.add_header('Set-Cookie', 'error="You are not authorized to view this page. Please login as an admin."; Path=/')
			self.response.headers.add_header('Set-Cookie', 'admin=""; Expires=%s' % (datetime.datetime.now() + datetime.timedelta(-1)))
			self.redirect('/error')
		
		global values
		values['first_name'] = escape_html(self.request.get("first_name"))
		values['last_name'] = escape_html(self.request.get("last_name"))
		values['dob'] = escape_html(self.request.get("dob"))
		values['sex'] = escape_html(self.request.get("sex"))
		values['message'] = "User already in database"
		
		if valid_user_entry(values['first_name'],values['last_name'],values['dob'],values['sex']) and not valid_user(values['first_name'],values['last_name'],values['dob'],values['sex']):
			user = User()
			user.first_name = values['first_name']
			user.last_name = values['last_name']
			user.dob = return_hash(values['dob'])
			user.sex = return_hash(values['sex'])
			user.game1 = 0
			user.game2 = 0
			user.game3 = 0
			user.game4 = 0
			user.put()
			update_values(message="User added")
			logging.info("here")
			time.sleep(0.2)

		persons = User.all()
		for p in persons:
			logging.info(p.first_name)
		self.write_form(**values)
	
	def write_form(self, **template_values):
		logging.info("**** AddUser Write_Form ****")
		template = JINJA_ENVIRONMENT.get_template('templates/form.html')
		self.response.write(template.render(title="Add User", user=self.request.cookies.get("user"), admin=self.request.cookies.get("admin"), **template_values))

#Admin login page
class AdminLogin(webapp2.RequestHandler):
	def get(self):
		logging.info("**** AdminLogin Get ****")
		if check_admin(self.request.cookies.get('admin')):
			self.response.headers.add_header('Set-Cookie', 'error="You are already logged in as an admin."; Path=/')
			self.redirect('/error')
		update_values()
		self.write_form(error="",message="")
		
	def post(self):
		logging.info("**** AdminLogin Post ****")
		if check_admin(return_hash(escape_html(self.request.get("admin")))):
			self.response.headers.add_header('Set-Cookie', 'admin=%s; Path=/' % return_hash(ADMIN_PASS))
			self.redirect('/home')
		self.write_form(error="Incorrect Password",message="")
		
	def write_form(self, **template_values):
		logging.info("**** AdminLogin Write_Form ****")
		template = JINJA_ENVIRONMENT.get_template('templates/admin.html')
		self.response.write(template.render(title="Admin Login", user=self.request.cookies.get("user"), admin=self.request.cookies.get("admin"), **template_values))
		
#Default home page to redirect to other pages
class Default(webapp2.RequestHandler):
	def get(self):
		logging.info("**** Default Get ****")
		if (check_admin(self.request.cookies.get("admin")) or check_user(self.request.cookies.get("user"))):
			self.redirect('/home')
		else:
			self.redirect('/user')
		
#Something isnt right
class Error(webapp2.RequestHandler):
	def get(self):
		global values
		logging.info("**** Error Get ****")
		template = JINJA_ENVIRONMENT.get_template('templates/error.html')
		self.response.write(template.render(title="Error", user=self.request.cookies.get("user"), admin=self.request.cookies.get("admin"), message=self.request.cookies.get('error')))

#View user files
class Files(webapp2.RequestHandler):
	def get(self):
		if not check_admin(self.request.cookies.get("admin")):
			self.response.headers.add_header('Set-Cookie', 'error="You must be logged in as an admin."; Path=/')
			self.redirect('/error')
		template = JINJA_ENVIRONMENT.get_template('templates/files.html')
		self.response.write(template.render(title="User Files", user=self.request.cookies.get("user"), admin=self.request.cookies.get("admin")))
		
#Play game 1-5
class Game(webapp2.RequestHandler):
	def get(self, game_num):
		logging.info("**** Game%s Get ****" % game_num)
		if not (check_admin(self.request.cookies.get("admin")) or check_user(self.request.cookies.get("user"))):
			self.response.headers.add_header('Set-Cookie','error="You must login as either an admin or user in order to continue to this site."; Path=/')
			self.response.headers.add_header('Set-Cookie', 'admin=""; Path=/')
			self.response.headers.add_header('Set-Cookie', 'user=""; Path=/')
			self.redirect('/error')
		template = JINJA_ENVIRONMENT.get_template('templates/game%s.html' % game_num)
		self.response.write(template.render(game=game_num))

#Finished game congratulations
class GameFinished(webapp2.RequestHandler):
	def get(self, points):
		logging.info("**** GameFinished Get ****")
		template = JINJA_ENVIRONMENT.get_template('templates/game_finished.html')
		self.response.write(template.render(title="Game Finished", user=self.request.cookies.get("user"), admin=self.request.cookies.get("admin"), points=int(points)))
	
#Show form for user to give feedback	
class GiveFeedback(webapp2.RequestHandler):
	def get(self):
		logging.info("**** GiveFeedback Get ****")
		if not (check_admin(self.request.cookies.get("admin")) or check_user(self.request.cookies.get("user"))):
			self.response.headers.add_header('Set-Cookie','error="You must login as a user in order to continue to this site."; Path=/')
			self.response.headers.add_header('Set-Cookie', 'admin=""; Path=/')
			self.response.headers.add_header('Set-Cookie', 'user=""; Path=/')
			self.redirect('/error')
		template = JINJA_ENVIRONMENT.get_template('templates/feedback.html')
		self.response.write(template.render(title="Give Feedback", user=self.request.cookies.get("user"), admin=self.request.cookies.get("admin")))
		
	def post(self):
		logging.info("**** GiveFeedback Post ****")
		if not (check_admin(self.request.cookies.get("admin")) or check_user(self.request.cookies.get("user"))):
			self.response.headers.add_header('Set-Cookie','error="You must login as a user in order to continue to this site."; Path=/')
			self.response.headers.add_header('Set-Cookie', 'admin=""; Path=/')
			self.response.headers.add_header('Set-Cookie', 'user=""; Path=/')
			self.redirect('/error')
		name = escape_html(self.request.get("name"))
		feedback = escape_html(self.request.get("feedback"))
		if name and feedback:
			user_feedback = Feedback()
			user_feedback.name = name
			user_feedback.created = datetime.datetime.now()
			user_feedback.feedback = escape_html(self.request.get("feedback"))
			user_feedback.put()
			time.sleep(0.2)
		
			template = JINJA_ENVIRONMENT.get_template('templates/feedback.html')
			self.response.write(template.render(title="Give Feedback", user=self.request.cookies.get("user"), admin=self.request.cookies.get("admin"), message="Your input will be considered! Thank you!"))
		else:
			template = JINJA_ENVIRONMENT.get_template('templates/feedback.html')
			self.response.write(template.render(title="Give Feedback", user=self.request.cookies.get("user"), admin=self.request.cookies.get("admin"), message="Please input both name and feedback."))
			
#Successful sign in
class Home(webapp2.RequestHandler):
	def get(self):
		logging.info("**** Home Get ****")
		if not (check_admin(self.request.cookies.get("admin")) or check_user(self.request.cookies.get("user"))):
			self.response.headers.add_header('Set-Cookie','error="You must login as either an admin or user in order to continue to this site."; Path=/')
			self.response.headers.add_header('Set-Cookie', 'admin=""; Path=/')
			self.response.headers.add_header('Set-Cookie', 'user=""; Path=/')
			self.redirect('/error')
		template = JINJA_ENVIRONMENT.get_template('templates/home.html')
		self.response.write(template.render(title="Welcome Page", user=self.request.cookies.get("user"), admin=self.request.cookies.get("admin")))

#Logout of user or admin accounts
class Logout (webapp2.RequestHandler):
	def get(self, logout_from):
		logging.info("**** Logout Get ****")
		self.response.headers.add_header('Set-Cookie', '%s=""; Path=/' % logout_from)
		self.redirect('/%s' % logout_from)
	
#Show all feed back to admin
class ViewFeedback(webapp2.RequestHandler):
	def get(self):
		logging.info("**** ViewFeedback Get ****")
		if not check_admin(self.request.cookies.get('admin')):
			self.response.headers.add_header('Set-Cookie', 'error="You are not authorized to view this page. Please login as an admin."; Path=/')
			self.response.headers.add_header('Set-Cookie', 'admin=""; Expires=%s' % (datetime.datetime.now() + datetime.timedelta(-1)))
			self.redirect('/error')
		all_feedback = db.GqlQuery("SELECT * FROM Feedback ORDER BY created")
		template = JINJA_ENVIRONMENT.get_template('templates/show_feedback.html')
		self.response.write(template.render(title="View Feedback", user=self.request.cookies.get("user"), admin=self.request.cookies.get("admin"), all_feedback=all_feedback))

#Login as a user
class UserLogin(webapp2.RequestHandler):
	def get(self):
		logging.info("**** UserLogin Get ****")
		if check_user(self.request.cookies.get("user")):
			self.response.headers.add_header('Set-Cookie','error="You are already logged in as a user."; Path=/')
			self.redirect('/error')
		update_values()
		self.write_form(**values)
	
	def post(self):
		logging.info("**** UserLogin Post ****")
		global values
		update_values()
		
		values['first_name'] = escape_html(self.request.get("first_name"))
		values['last_name'] = escape_html(self.request.get("last_name"))
		values['dob'] = escape_html(self.request.get("dob"))
		values['sex'] = escape_html(self.request.get("sex"))
				
		user_id = valid_user(values['first_name'],values['last_name'],values['dob'],values['sex'])
		
		if user_id:
			self.response.headers.add_header('Set-Cookie', 'user=%s; Path=/' % (str(user_id) + '|' + return_hash(str(user_id))))
			self.redirect('/home')
		self.write_form(**values)
	
	def write_form(self, **template_values):
		logging.info("**** UserLogin Write_Form ****")
		template = JINJA_ENVIRONMENT.get_template('templates/form.html')
		self.response.write(template.render(title="Login",user=self.request.cookies.get("user"), admin=self.request.cookies.get("admin"), **template_values))		
	
application = webapp2.WSGIApplication([
	('/', Default),
	('/about', About),
	('/add', AddUser),
	('/admin', AdminLogin),
	('/error', Error),
	('/files', Files),
	('/game([1-6])', Game),
	('/game_finished(\d|1\d)', GameFinished),
	('/give_feedback', GiveFeedback),
	('/home',Home),
	('/logout/(user|admin)', Logout),
	('/user', UserLogin),
	('/view_feedback', ViewFeedback),
], debug=True)