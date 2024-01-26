from dataclasses import dataclass
from typing import Dict
import schoolopy
import sys
import time
from enum import Enum
from datetime import datetime

TIMEOUT = 60

@dataclass
class SchoologyData:
    start: bool = False
    oauth_url: str = ""
    authorization: bool = False
    timeout: bool = False
    display_name: str = "null"
    student: bool = False
    grade: str = "null"

    def json(self):
        info =  "{\n"

        for name, state in self.__dict__.items():
            info += f'"{name}": "{state if type(state) == str else str(state).lower()}",\n'
        info = info[:-2] + "\n}"

        return info

# defines the grades based off of graduating class
class Grades(dict[int, str]):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if datetime.now().month > 8:
            grad_year = datetime.now().year + 1
        else:
            grad_year = datetime.now().year

        self.__dict__ = self
        self.update({
            str(grad_year): "12",
            str(grad_year+1): "11",
            str(grad_year+2): "10",
            str(grad_year+3): "9",
        })

    
def main():
    if len(sys.argv) != 3:
        sys.stderr.write("ERROR: Invalid number of arguments")
        sys.stderr.flush()
        sys.exit(1)
    
    key = sys.argv[1]
    secret = sys.argv[2]

    auth = schoolopy.Auth(key, secret, three_legged=True, domain='https://schoology.newton.k12.ma.us/')

    
    start_time = time.perf_counter()

    data = SchoologyData(oauth_url=auth.request_authorization(), start=True)

    sys.stdout.write(data.json())
    sys.stdout.flush()

    while not auth.authorize() and time.perf_counter() - start_time < TIMEOUT:
        time.sleep(.1)
    

    if time.perf_counter() - start_time >= TIMEOUT:
        data.timeout = True
        sys.stderr.write(data.json())
        sys.stderr.flush()
        sys.exit(1)
    
    # Move forward with schoology authorization if they've authorized
    if auth.authorize():
        schoology = schoolopy.Schoology(auth)
        data.start = False
        data.authorization = True
        data.display_name = schoology.get_me().name_display
        email = schoology.get_me().primary_email
        
        # Checks if first 9 characters of email are a number, which determines if the user is a student
        if email[:9].isnumeric():
            data.student = True
        else:
            data.student = False
            sys.stderr.write(data.json())
            sys.stderr.flush()
            sys.exit(1)
        
        # Grabs courses of student
        # Searches for course: "NSHS Library: Class of {grad year}"
        # Determines grade from there
        uid = schoology.get_me().uid
        sections = schoology.get_user_sections(uid)
        for section in sections:
            courseTitle = section.course_title
            for grade in Grades():
                if "Class of " + grade in courseTitle:
                    data.grade = Grades()[grade]
                    break
        # Grade is kept "null" if there is no course
        
        sys.stdout.write(data.json())
        sys.stdout.flush()
        sys.exit(0)


main()