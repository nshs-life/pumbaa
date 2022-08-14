const { schoologyKey, schoologySecret } = require('./config.json');


async function welcome() {
    // Schoology verification
    const { spawn } = require("child_process");
    const pythonProcess = spawn('python', ["schoology.py", schoologyKey, schoologySecret]);

    if (pythonProcess.exitCode != 0 && pythonProcess.exitCode != null) {
        console.log("Error: " + pythonProcess.stderr.toString());
    }
    
    pythonProcess.stdout.on('data', (data) => {
            data = data.toString();
            json = JSON.parse(data);
            oauth_url = json.oauth_url;
        }
    );
}

schoology();