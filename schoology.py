from dataclasses import dataclass
from typing import Optional
import schoolopy
import sys
import time 

@dataclass
class SchoologyReturnInfo:
    authorization: str = "false"
    display_name: str = "null"
    oauth_url: str = "null"
    timeout: str = "false"

    def json(self):
        info =  "{"

        for name, state in self.__dict__.items():
            info += f'"{name}": "{state}",\n'
        info = info[:-2] + "}"

        return info

class Schoology:
    def __init__(self, key, secret):
        self.key = key
        self.secret = secret
        self.auth = auth = schoolopy.Auth(key, secret, three_legged=True, domain='https://schoology.newton.k12.ma.us/')  # Replace URL with that of your school's Schoology

    def auth_url(self):
        return self.auth.request_authorization()

    def get_name(self) -> Optional[schoolopy.User]:
        if not self.auth.authorize:
            return None
        sc = schoolopy.Schoology(self.auth)

        person = sc.get_me()

        if person is None:
            return None
        
        try:
            return person.name_display
        except:
            return None
    
    def is_authorized(self) -> bool:
        return self.auth.authorize()

def main():
    if len(sys.argv) != 3:
        sys.stderr.write("ERROR: Invalid number of arguments")
        sys.stderr.flush()
        sys.exit(1)
    
    key = sys.argv[1]
    secret = sys.argv[2]

    schoology = Schoology(key, secret)
    return_info = SchoologyReturnInfo()
    return_info.oauth_url = schoology.auth_url()

    sys.stdout.write(return_info.json())
    sys.stdout.flush()

    counter = 0
    while not schoology.is_authorized():
        counter += 1
        if counter > 20: 
            sys.stderr.write("ERROR: Schoology authorization timed out")
            sys.stderr.flush()
            sys.exit(1)
        time.sleep(1)

    return_info.authorization = "true"
    return_info.display_name = schoology.get_name()
    sys.stdout.write(return_info.json()) 
    sys.stdout.flush()

    sys.exit(0)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        sys.stdout.write(str(e))
        sys.stdout.flush()
        sys.exit(1)