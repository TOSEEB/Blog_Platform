# Quick Deployment Checklist

## 🗄️ MongoDB Atlas Setup (5 minutes)

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create FREE cluster
3. Database Access → Add user (save password!)
4. Network Access → Allow from anywhere (0.0.0.0/0)
5. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/blog-platform`

---

## 🚀 Render Backend (10 minutes)

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. New → Web Service → Connect GitHub repo
3. Settings:
   - **Name**: `blog-platform-api`
   - **Build**: `npm install`
   - **Start**: `npm start`
4. Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blog-platform
   JWT_SECRET=your-32-character-secret-key-here
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Deploy → Wait → Copy URL: `https://xxx.onrender.com`

---

## 🎨 Vercel Frontend (5 minutes)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Add New Project → Import repo
3. Settings:
   - **Framework**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output**: `build`
4. Environment Variable:
   ```
   REACT_APP_API_URL=https://xxx.onrender.com/api
   ```
   (Use your Render URL from step above)
5. Deploy → Wait → Copy URL: `https://xxx.vercel.app`

---

## ✅ Test

1. Visit frontend URL
2. Register a user
3. Create a post
4. Done! 🎉

---

## 🔧 If CORS Error

Update `server.js` line 15:
```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:3001'],
  credentials: true
}));
```

Then redeploy to Render.

---

## 📝 Files Created

- `render.yaml` - Render config (optional)
- `vercel.json` - Vercel config
- `.gitignore` - Git ignore file
- `DEPLOYMENT_GUIDE.md` - Full guide
- `QUICK_DEPLOY.md` - This file

