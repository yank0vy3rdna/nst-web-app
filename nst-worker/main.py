import subprocess
import sys
import time
import uuid


def main():
    worker_id = str(uuid.uuid4())

    print(f"Worker {worker_id} started")
    while True:
        # Spawn a new process to run the function
        process = subprocess.Popen([sys.executable, '-c', f'from try_to_work import try_to_work; try_to_work("{worker_id}")'])

        # Wait for the process to finish and get its return code
        return_code = process.wait()

        # Check if the subprocess was successful
        if return_code != 0:
            print('Subprocess failed with return code:', return_code)
        time.sleep(3)


if __name__ == '__main__':
    main()
