# Deployment Guide - Vercel (Frontend) + Render (Backend)

This guide will help you deploy your MERN stack blog platform to production.

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be on GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Render Account** - Sign up at [render.com](https://render.com)
4. **MongoDB Atlas Account** - For cloud database (free tier available)

---

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new cluster (choose FREE tier)

### 1.2 Configure Database Access
1. Go to **Database Access** → **Add New Database User**
2. Create username and password (save these!)
3. Set privileges to **Read and write to any database**

### 1.3 Configure Network Access
1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (0.0.0.0/0)
3. Click **Confirm**

### 1.4 Get Connection String
1. Go to **Database** → Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
4. Replace `<password>` with your database user password
5. Add database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/blog-platform`

**Save this connection string - you'll need it for Render!**

---

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Prepare Backend for Deployment

1. **Update `server.js`** - Make sure it's ready:
   ```javascript
   // Already configured ✅
   ```

2. **Create `render.yaml`** (optional, for easier setup):
   ```yaml
   services:
     - type: web
       name: blog-platform-api
       env: node
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 10000
         - key: MONGODB_URI
           sync: false
         - key: JWT_SECRET
           sync: false
   ```

### 2.2 Deploy to Render

1. **Login to Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub

2. **Create New Web Service**
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Select your `Blog_Platform` repository

3. **Configure Service**
   - **Name**: `blog-platform-api` (or any name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose **Free** (or paid if you want)

4. **Add Environment Variables**
   Click **Advanced** → **Add Environment Variable**:
   ```
   NODE_ENV = production
   PORT = 10000
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/blog-platform
   JWT_SECRET = your-super-secret-jwt-key-at-least-32-characters-long
   ```

   **Important**: 
   - Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
   - Generate a strong `JWT_SECRET` (at least 32 characters)

5. **Deploy**
   - Click **Create Web Service**
   - Wait for deployment (5-10 minutes)
   - Once deployed, you'll get a URL like: `https://blog-platform-api.onrender.com`

6. **Test Your Backend**
   - Visit: `https://your-app.onrender.com/`
   - Should see: `{"message":"Blog Platform API is running"}`

**Save your Render backend URL!**

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Update Frontend API URL

1. **Update `client/src/utils/api.js`**:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
   ```

2. **Create `client/.env.production`**:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```
   Replace `your-backend-url` with your actual Render URL

### 3.2 Deploy to Vercel

1. **Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub

2. **Import Project**
   - Click **Add New** → **Project**
   - Import your GitHub repository
   - Select `Blog_Platform` repository

3. **Configure Project**
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)

4. **Add Environment Variables**
   Click **Environment Variables** → Add:
   ```
   REACT_APP_API_URL = https://your-backend-url.onrender.com/api
   ```
   Replace with your actual Render backend URL

5. **Deploy**
   - Click **Deploy**
   - Wait for build (2-5 minutes)
   - Once deployed, you'll get a URL like: `https://blog-platform.vercel.app`

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Backend
- Visit: `https://your-backend.onrender.com/`
- Should return: `{"message":"Blog Platform API is running"}`

### 4.2 Test Frontend
- Visit: `https://your-app.vercel.app`
- Should load your blog platform
- Try registering a new user
- Create a post

### 4.3 Common Issues

**Issue: CORS Error**
- **Fix**: Make sure your Render backend URL is in the CORS whitelist
- Update `server.js`:
  ```javascript
  app.use(cors({
    origin: ['https://your-app.vercel.app', 'http://localhost:3001']
  }));
  ```

**Issue: API Not Connecting**
- Check `REACT_APP_API_URL` in Vercel environment variables
- Make sure it includes `/api` at the end
- Redeploy frontend after changing env vars

**Issue: MongoDB Connection Failed**
- Check MongoDB Atlas Network Access (should allow 0.0.0.0/0)
- Verify connection string has correct password
- Check database user has proper permissions

---

## 🔧 Step 5: Update CORS (If Needed)

If you get CORS errors, update `server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:3001',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

Then redeploy to Render.

---

## 📝 Step 6: Update Package.json Scripts

Make sure your `package.json` has:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

## 🔐 Step 7: Security Checklist

- ✅ Strong JWT_SECRET (32+ characters)
- ✅ MongoDB password is strong
- ✅ CORS configured properly
- ✅ Environment variables set in both platforms
- ✅ No sensitive data in code

---

## 🎉 You're Live!

Your blog platform is now deployed:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

---

## 📚 Additional Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

## 💡 Tips

1. **Free Tier Limits**:
   - Render free tier: Spins down after 15 min inactivity (first request may be slow)
   - Vercel free tier: Unlimited requests, great for frontend

2. **Custom Domain**:
   - Both platforms support custom domains
   - Add in project settings

3. **Monitoring**:
   - Check Render logs for backend issues
   - Check Vercel logs for frontend build issues

4. **Updates**:
   - Push to GitHub → Auto-deploys
   - Both platforms auto-deploy on git push

---

Good luck with your deployment! 🚀

