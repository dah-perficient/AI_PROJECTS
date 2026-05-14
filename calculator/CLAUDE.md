# This is a multi tool Calculator

## Description

The calulator is intregrated into a simple chat app. The user can ask basic questions, and get answers back from Claude. However if the message means an of the criteria, it will use a math tool instead.

## Capabilities, tools that handle

### UI/UX

The whole project should have match the ui/ux found in `../multi-turn/client/src/App.tsx`

### Each of the follow is its own tool

All of them start when a list of numbers is found, along with one of the following key words 

- Add: return the sum of all of the numbers in the list
- Subtract: each other from a list of number
- Multiple: each member of the list against the result of the previous. For example, in the list `(a,b,c,d)` you would expect `(a*b)+(b*c)+(c*d)`
- If there are only two numbers past in, these additional tools will be possible
  - Standard division (a/b) 
- Solve basic algrbra problems like `5x = 2 + x`

## Misc.

- `README.md`
  - At top level, and in client and server
- Top level `package.json` with the following:
```json
{
    "name": "calculator",
    "version": "0.0.1",
    "private": true,
    "scripts": {
        "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\" --names \"frontend,backend\" --prefix-colors \"blue,green\"",
        "dev:client": "cd client && npm run dev",
        "dev:server": "cd server && npm run dev",
        "install:all": "npm install && cd client && npm install && cd ../server && npm install"
    },
    "devDependencies": {
        "concurrently": "^9.0.0"
    }
}
```