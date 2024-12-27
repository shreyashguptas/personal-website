import { Project } from './types'

export const projects: Project[] = [
  {
    title: "Congressional Bill Tracker",
    year: "2024",
    githubUrl: "https://billsincongress.com/",
    tags: ["Next.js", "Supabase", "API"],
    date: new Date('2024-12-20'),
    pinned: true,
    image: "/images/projects/Congressional Bill Tracker.webp",
    details: "A modern platform that makes congressional bills accessible to everyone by using AI to generate clear summaries, provide real-time updates, and visualize the legislative process. Features include bill tracking, plain English summaries, and comprehensive information about sponsors and voting records."
  },
  {
    title: "Student Graduation Outcomes Dashboard",
    year: "2024",
    githubUrl: "https://career.uark.edu/aboutus/studentstats/",
    tags: ["PowerBI", "Data Visualization", "PowerQuery"],
    date: new Date('2024-12-04'),
    details: "This PowerBI dashboard presents the post-graduation outcomes of University of Arkansas students, detailing their employment, volunteer activities, and other paths, along with salary statistics by college."
  },
  {
    title: "ConvertShift",
    year: "2024",
    githubUrl: "https://www.convertshift.com/",
    tags: ["Next.js", "File Converter", "Web Application"],
    date: new Date('2024-12-04'),
    pinned: true,
    image: "/images/projects/Convert-shift.webp",
    details: "A user-friendly web application built with Next.js that enables seamless file conversion between various formats."
  },
  {
    title: "Machine Learning for Dummies",
    year: "2024",
    githubUrl: "https://mlfordummy.com/",
    tags: ["PyTorch", "Machine Learning", "Python"],
    date: new Date('2024-11-23'),
    pinned: true,
    image: "/images/projects/machine-learning-for-dummies.jpg",
    details: "A beginner-friendly platform that simplifies machine learning concepts through interactive tutorials and practical examples using PyTorch."
  },
  {
    title: "Raspberry Pi Camera Web Stream",
    year: "2024",
    githubUrl: "https://github.com/shreyashguptas/Raspberry-Pi-Camera-Web-Stream",
    tags: ["Raspberry Pi", "Python", "Web Stream"],
    date: new Date('2024-11-10'),
    details: "This project sets up a live web stream from a Raspberry Pi camera module that can be accessed from any device on your local network through a web browser."
  },
  {
    title: "Credit Card Fraud Detection using Machine Learning",
    year: "2024",
    githubUrl: "https://github.com/shreyashguptas/Credit-Card-Fraud-Detection-using-Machine-Learning",
    tags: ["PyTorch", "Machine Learning", "Python"],
    date: new Date('2024-01-10'),
    pinned: true,
    image: "/images/projects/Credit Card Fraud Detection using Machine Learning.jpg",
    details: "A real-time machine learning system using PyTorch to detect fraudulent credit card transactions with high accuracy."
  },
  {
    title: "Options Pricing Models",
    year: "2024",
    githubUrl: "https://github.com/shreyashguptas/option-pricing-models",
    tags: ["Python", "Finance", "Quantitative Analysis"],
    date: new Date('2024-01-10'),
    details: "A web app for calculating European option prices using Black-Scholes, Monte Carlo simulation, and Binomial models, implemented in Python 3.9 with Streamlit for visualization."
  },
  {
    title: "CAPTCHA Recognition using Convolutional Recurrent Neural Network(CRNN)",
    year: "2024",
    githubUrl: "https://github.com/shreyashguptas/CAPTCHA-Recognition-using-CRNN",
    tags: ["Pytorch", "Machine Learning", "Python"],
    date: new Date('2024-01-10'),
    image: "/images/projects/CAPTCHA Recognition using Convolutional Recurrent Neural Network(CRNN).jpg",
    details: "A high-accuracy CAPTCHA recognition system utilizing CRNN architecture for effective decoding of complex CAPTCHAs."
  },
  {
    title: "IMDb Movie Review Sentiment Analysis",
    year: "2024",
    githubUrl: "https://github.com/shreyashguptas/IMDb_movie_review_sentiment_analysis",
    tags: ["NLP", "Machine Learning", "Python"],
    date: new Date('2024-01-10'),
    details: "This project analyzes the discrepancies in IMDb movie ratings, particularly focusing on the impact of COVID-19 on viewer ratings and sentiment."
  },
  {
    title: "Stock Performance Correlation to News Sentiment",
    year: "2024",
    githubUrl: "https://github.com/shreyashguptas/News_sentiment_correlation_project",
    tags: ["Data Analysis", "Finance", "Python"],
    date: new Date('2024-01-10'),
    details: "This project automates the analysis of financial news sentiment and its impact on markets using advanced NLP techniques, providing insights that can guide investment decisions."
  },
  {
    title: "MeToo Movement Impact on IMDb Ratings",
    year: "2023",
    githubUrl: "https://github.com/shreyashguptas/MeToo-Movement-Impact-on-IMDb-ratings",
    tags: ["Data Analysis", "Social Impact", "Python"],
    date: new Date('2023-01-10'),
    details: "This project analyzes the impact of the MeToo movement on IMDb ratings by comparing changes in ratings for productions associated with individuals accused of sexual misconduct before and after 2017."
  },
  {
    title: "Organisation wide Google Cloud Security Roles Refactoring",
    year: "2022",
    githubUrl: "https://github.com/shreyashguptas/Organisation-wide-Google-Cloud-Security-Roles-Refactoring",
    tags: ["Google Cloud", "Terraform"],
    date: new Date('2022-01-10'),
    details: "Audited and optimized Google Cloud security roles at Tyson Foods to align user permissions with actual needs, enhancing security and operational efficiency."
  },
  {
    title: "Inventory PowerBI Dashboard for Supplychain",
    year: "2022",
    githubUrl: "https://github.com/shreyashguptas/Inventory-PowerBI-Dashboard-for-Supplychain",
    tags: ["PowerBI", "AtScale"],
    date: new Date('2022-01-10'),
    details: "Created a PowerBI dashboard for inventory management at Tyson Foods, offering real-time insights into stock levels and pallet weights to enhance decision-making and optimize inventory control."
  }
]

