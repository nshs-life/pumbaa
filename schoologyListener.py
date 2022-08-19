from dataclasses import dataclass
import schoolopy
import sys
import time

TIMEOUT = 60

@dataclass
class SchoologyData:
    start: bool = False
    oauth_url: str = ""
    authorization: bool = False
    timeout: bool = False
    display_name: str = "null"

    def json(self):
        info =  "{"

        for name, state in self.__dict__.items():
            info += f'"{name}": "{state if type(state) == str else str(state).lower()}",\n'
        info = info[:-2] + "}"

        return info

def main():
    if len(sys.argv) != 3:
        sys.stderr.write("ERROR: Invalid number of arguments")
        sys.stderr.flush()
        sys.exit(1)
    
    key = sys.argv[1]
    secret = sys.argv[2]

    schoology = schoolopy.Auth(key, secret, three_legged=True, domain='https://schoology.newton.k12.ma.us/')

    start_time = time.perf_counter()

    data = SchoologyData(oauth_url=schoology.request_authorization(), start=True)

    sys.stdout.write(data.json())
    sys.stdout.flush()

    while not schoology.authorize() and time.perf_counter() - start_time < TIMEOUT:
        time.sleep(.1)
    

    if time.perf_counter() - start_time >= TIMEOUT:
        data.timeout = True
        sys.stderr.write(data.json())
        sys.stderr.flush()
        sys.exit(1)
    
    if schoology.authorize():
        data.start = False
        data.authorization = True
        data.display_name = schoolopy.Schoology(schoology).get_me().name_display
        sys.stdout.write(data.json())
        sys.stdout.flush()
        sys.exit(0)
    
main()