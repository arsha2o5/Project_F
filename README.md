# Project_F
Mobile app where you take care of your pet by taking care of yourself.

## Setup (working in the terminal, you will need to isntal git, node.js and expo if you don't have them already)

1. Clone repo

git clone https://github.com/yourname/project_f.git

2. Install dependencies (this installs files that do not get pushed into the repo to save up on the memory usage. All the files not pushed into the repo are defined in the gitignore file)

npm install

3. Start Expo (This starts the local expo server that runs the mobile app. Make sure to download Expo Go from appstore and scan the QR code in the terminal to open the app on your phone)
Important details: if you have a Macbook and an iPhone you can run "npm run ios"(you'll need Xcode for this), if you have a windows laptop and an android phone you run "npm run android", and in my case I have a windows latop and an iPhone for that use the command given below.

npm run ios
   or
npm run android
   or
npx expo start

4. Have fun