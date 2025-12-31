module.exports = {
    apps: [
        {
            name: "board_user_web",
            script: "node_modules/next/dist/bin/next",
            args: "start -p 4040 -H 0.0.0.0",
            cwd: "/var/www/html/board/user_web",
            exec_mode: "fork",
            instances: 1,
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};