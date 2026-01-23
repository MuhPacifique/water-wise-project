const { execSync } = require('child_process');

const PORT = 5001;

function cleanup() {
  console.log(`Checking for processes on port ${PORT}...`);
  try {
    let command = '';
    if (process.platform === 'win32') {
      command = `netstat -ano | findstr :${PORT} | findstr LISTENING`;
    } else {
      command = `lsof -i tcp:${PORT} -t`;
    }

    const output = execSync(command).toString().trim();
    if (output) {
      const lines = output.split('\n');
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = process.platform === 'win32' ? parts[parts.length - 1] : parts[0];
        
        if (pid && pid !== process.pid.toString()) {
          console.log(`Terminating process ${pid} on port ${PORT}...`);
          try {
            process.kill(pid, 'SIGKILL');
          } catch (e) {
            if (process.platform === 'win32') {
              execSync(`taskkill /F /PID ${pid}`);
            }
          }
        }
      });
    }
  } catch (err) {
    // No process found or error in command
  }
}

cleanup();
