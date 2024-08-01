import { exec } from 'child_process';


export class Authorizer {
    constructor() { }

    /**
     * Login
     * @param username - account name
     * @param password - account password
     * @returns {Promise<boolean>}
     */
    public async login(username: string, password: string): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            const command = `echo ${password} | su -c "echo Success" ${username}`;
            // console.log('exec command:', command);

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    // console.error('Error:', error);
                    resolve(false);
                }
                else {
                    if (stderr) {
                        // console.error('stderr:', stderr);
                    }

                    resolve((stdout.trim() === 'Success'));
                }
            });
        });
    }
}
