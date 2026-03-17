# Project_F
Mobile app where you take care of your pet by taking care of yourself.

## Git: instructions on how to push your changes and manage your branches.

- Clone repo

`git clone URL`

- Create branch

`git checkout -b feature-name`

- Push branch

`git push origin feature-name`

- Pull latest code (This is **NOT** the same thing as a Pull Request. This takes the code from the specified branch, in this case *main*, and merges it into your local branch on your computer. This is used so that you keep your branch up to date with the *main* changes)

`git pull origin main`

## Setup (working in the terminal, you will need to isntal git, node.js and expo if you don't have them already)

1. Clone repo

git clone https://github.com/yourname/project_f.git

2. Install dependencies (this installs files that do not get pushed into the repo to save up on the memory usage. All the files not pushed into the repo are defined in the gitignore file)

`npm install`

3. Start Expo (This starts the local expo server that runs the mobile app. Make sure to download Expo Go from appstore and scan the QR code in the terminal to open the app on your phone)
*Important details: if you have a Macbook and an iPhone you can run "npm run ios"(you'll need Xcode for this), if you have a windows laptop and an android phone you run "npm run android", and in my case I have a windows latop and an iPhone for that use the command given below.*

- `npm run ios`

    or

- `npm run android`

    or

- `npx expo start`

4. The project should look like this in vscode
```
Project_F
├── app
├── assets
├── components
├── package.json
└── README.md
``` 

4. Have fun
