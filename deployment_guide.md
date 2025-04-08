# FitTribe.fitness Static Demo Deployment Guide

This guide provides step-by-step instructions for deploying the static demo version of FitTribe.fitness to various hosting platforms. The static demo consists of HTML files with Tailwind CSS styling and can be easily deployed to any static site hosting service.

## Option 1: Deploy to GitHub Pages (Free)

GitHub Pages is a free hosting service that allows you to publish static websites directly from a GitHub repository.

### Prerequisites
- GitHub account
- Git installed on your local machine

### Deployment Steps

1. **Create a GitHub Repository**
   ```bash
   # Initialize git in the project directory
   cd /home/ubuntu/FitTribe
   git init
   
   # Add all files to git
   git add .
   
   # Commit the files
   git commit -m "Initial commit of FitTribe static demo"
   ```

2. **Create a new repository on GitHub**
   - Go to [GitHub](https://github.com) and sign in
   - Click on the "+" icon in the top right corner and select "New repository"
   - Name your repository (e.g., "fittribe-demo")
   - Keep it public if you want to use GitHub Pages with a free account
   - Do not initialize with README, .gitignore, or license
   - Click "Create repository"

3. **Push your code to GitHub**
   ```bash
   # Add the remote repository
   git remote add origin https://github.com/YOUR_USERNAME/fittribe-demo.git
   
   # Push the code to GitHub
   git push -u origin main
   ```

4. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to the "GitHub Pages" section
   - Under "Source", select "main" branch and "/root" folder
   - Click "Save"
   - GitHub will provide you with a URL where your site is published (e.g., https://YOUR_USERNAME.github.io/fittribe-demo/)

## Option 2: Deploy to Netlify (Free)

Netlify offers free hosting for static websites with additional features like custom domains and continuous deployment.

### Prerequisites
- Netlify account (can sign up with GitHub)
- Git repository (can use the GitHub repo from Option 1)

### Deployment Steps

1. **Sign up for Netlify**
   - Go to [Netlify](https://www.netlify.com/) and sign up or log in
   - You can sign up using your GitHub account for easier integration

2. **Deploy from Git**
   - Click on "New site from Git"
   - Select GitHub as your Git provider
   - Authorize Netlify to access your GitHub repositories
   - Select your FitTribe repository
   - Configure build settings:
     - Build command: leave empty (no build required for static HTML)
     - Publish directory: `static_demo` (since that's where the HTML files are)
   - Click "Deploy site"

3. **Configure Custom Domain (Optional)**
   - After deployment, Netlify will assign a random subdomain (e.g., random-name.netlify.app)
   - To use a custom domain:
     - Go to "Domain settings"
     - Click "Add custom domain"
     - Follow the instructions to configure your domain's DNS settings

## Option 3: Deploy to Vercel (Free)

Vercel is another excellent platform for static site hosting with a generous free tier.

### Prerequisites
- Vercel account (can sign up with GitHub)
- Git repository (can use the GitHub repo from Option 1)

### Deployment Steps

1. **Sign up for Vercel**
   - Go to [Vercel](https://vercel.com/) and sign up or log in
   - You can sign up using your GitHub account for easier integration

2. **Import your Git Repository**
   - Click "Import Project"
   - Select "Import Git Repository"
   - Select your FitTribe repository
   - Configure project settings:
     - Framework Preset: Other
     - Root Directory: `static_demo`
     - Build Command: leave empty
     - Output Directory: `.` (current directory)
   - Click "Deploy"

3. **Configure Custom Domain (Optional)**
   - After deployment, go to "Project Settings" > "Domains"
   - Add your custom domain and follow the instructions to configure DNS

## Option 4: Deploy to AWS S3 + CloudFront (Low Cost)

For a more professional setup with global CDN, you can use AWS S3 and CloudFront.

### Prerequisites
- AWS account
- AWS CLI installed and configured

### Deployment Steps

1. **Create an S3 Bucket**
   ```bash
   aws s3 mb s3://fittribe-demo --region us-east-1
   ```

2. **Configure the Bucket for Static Website Hosting**
   ```bash
   aws s3 website s3://fittribe-demo --index-document index.html --error-document index.html
   ```

3. **Set Bucket Policy for Public Access**
   Create a file named `bucket-policy.json` with the following content:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::fittribe-demo/*"
       }
     ]
   }
   ```

   Apply the policy:
   ```bash
   aws s3api put-bucket-policy --bucket fittribe-demo --policy file://bucket-policy.json
   ```

4. **Upload the Website Files**
   ```bash
   aws s3 sync /home/ubuntu/FitTribe/static_demo s3://fittribe-demo
   ```

5. **Create a CloudFront Distribution (Optional)**
   - Go to the AWS Management Console
   - Navigate to CloudFront
   - Create a new distribution
   - For "Origin Domain Name", select your S3 bucket website endpoint
   - Configure other settings as needed
   - Create the distribution

## Option 5: Simple Local Deployment for Testing

If you just want to test the site locally or share it on your local network:

### Using Python's Built-in HTTP Server

```bash
cd /home/ubuntu/FitTribe/static_demo
python3 -m http.server 8000
```

The site will be available at http://localhost:8000

### Using Node.js and serve

```bash
# Install serve globally
npm install -g serve

# Serve the static files
cd /home/ubuntu/FitTribe/static_demo
serve -s .
```

The site will be available at http://localhost:5000

## Preparing Files for Deployment

Before deploying, you may want to make some adjustments to the static demo:

1. **Ensure all links are relative**
   - Check that all links between pages use relative paths
   - Verify that all resource links (CSS, JS, images) use relative paths

2. **Optimize images**
   - Compress images to reduce load time
   - Consider using WebP format for better compression

3. **Minify CSS and JavaScript**
   - If you have custom CSS or JavaScript files, consider minifying them

4. **Add a robots.txt file**
   - Create a simple robots.txt file in the static_demo directory
   - Example content:
     ```
     User-agent: *
     Allow: /
     ```

5. **Create a sitemap.xml file**
   - A basic sitemap helps search engines index your site
   - Example for the current structure:
     ```xml
     <?xml version="1.0" encoding="UTF-8"?>
     <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
       <url>
         <loc>https://yourdomain.com/index.html</loc>
       </url>
       <url>
         <loc>https://yourdomain.com/trainers.html</loc>
       </url>
       <url>
         <loc>https://yourdomain.com/trainer-profile.html</loc>
       </url>
     </urlset>
     ```

## Next Steps After Deployment

Once your static demo is deployed, consider these next steps:

1. **Set up analytics** (e.g., Google Analytics) to track visitor behavior
2. **Test the site** on various devices and browsers to ensure compatibility
3. **Share the URL** with stakeholders for feedback
4. **Plan the development** of the full-featured version with React/Node.js as described in the original requirements

## Future Deployment Considerations for Full Application

When you're ready to develop and deploy the full FitTribe.fitness application with React frontend and Node.js backend:

1. **Frontend Deployment**
   - Build the React application using `npm run build`
   - Deploy the build output to Vercel, Netlify, or similar platforms

2. **Backend Deployment**
   - Deploy the Node.js backend to platforms like Heroku, AWS Elastic Beanstalk, or DigitalOcean
   - Set up environment variables for API keys and database credentials

3. **Database Setup**
   - Create a PostgreSQL database on AWS RDS, Heroku Postgres, or similar services
   - Run migration scripts to set up the database schema

4. **Third-Party Integrations**
   - Configure Zoom API for virtual sessions
   - Set up Stripe for payment processing
   - Integrate with Google Calendar for scheduling

5. **CI/CD Pipeline**
   - Implement GitHub Actions for automated testing and deployment
   - Set up staging and production environments
