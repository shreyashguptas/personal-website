import { Project } from './types'

export const projects: Project[] = [
  {
    title: "Machine Learning for Dummies",
    year: "2024",
    githubUrl: "https://mlfordummy.com/",
    tags: ["PyTorch", "Machine Learning", "Python"],
    date: new Date('2024-11-23'),
    pinned: true,
    image: "/images/projects/machine-learning-for-dummies.jpg"
  },
  {
    title: "Raspberry Pi Camera Web Stream",
    year: "2024",
    githubUrl: "https://github.com/shreyashguptas/Raspberry-Pi-Camera-Web-Stream",
    tags: ["Raspberry Pi", "Python", "Web Stream"],
    date: new Date('2024-11-10')
  },
  {
    title: "Credit Card Fraud Detection using Machine Learning",
    year: "2024",
    githubUrl: "https://github.com/shreyashguptas/Credit-Card-Fraud-Detection-using-Machine-Learning",
    tags: ["PyTorch", "Machine Learning", "Python"],
    date: new Date('2024-01-10'),
    pinned: true,
    image: "/images/projects/Credit Card Fraud Detection using Machine Learning.jpg"
  },
  {
    title: "Options Pricing Models",
    year: "2024",
    githubUrl: "https://github.com/shreyashguptas/option-pricing-models",
    tags: ["Python", "Finance", "Quantitative Analysis"],
    date: new Date('2024-01-10')
  },
  {
    title: "CAPTCHA Recognition using Convolutional Recurrent Neural Network(CRNN)",
    year: "2024",
    githubUrl: "https://github.com/shreyashguptas/CAPTCHA-Recognition-using-CRNN",
    tags: ["Pytorch", "Machine Learning", "Python"],
    date: new Date('2024-01-10'),
    pinned: true,
    image: "/images/projects/CAPTCHA Recognition using Convolutional Recurrent Neural Network(CRNN).jpg"
  },
  {
    title: "IMDb Movie Review Sentiment Analysis",
    year: "2024",
    githubUrl: "https://github.com/shreyashguptas/IMDb_movie_review_sentiment_analysis",
    tags: ["NLP", "Machine Learning", "Python"],
    date: new Date('2024-01-10')
  },
  {
    title: "Stock Performance Correlation to News Sentiment",
    year: "2024",
    githubUrl: "https://github.com/shreyashguptas/News_sentiment_correlation_project",
    tags: ["Data Analysis", "Finance", "Python"],
    date: new Date('2024-01-10')
  },
  {
    title: "MeToo Movement Impact on IMDb Ratings",
    year: "2023",
    githubUrl: "https://github.com/shreyashguptas/MeToo-Movement-Impact-on-IMDb-ratings",
    tags: ["Data Analysis", "Social Impact", "Python"],
    date: new Date('2023-01-10')
  },
  {
    title: "Organisation wide Google Cloud Security Roles Refactoring",
    year: "2022",
    githubUrl: "https://github.com/shreyashguptas/Organisation-wide-Google-Cloud-Security-Roles-Refactoring",
    tags: ["Google Cloud", "Terraform"],
    date: new Date('2022-01-10'),
    details: "This project involved auditing and optimizing security roles for employees accessing Google Cloud datasets at Tyson Foods. We found many users were overprivileged, necessitating a detailed analysis of individual needs. The process included reviewing thousands of permissions, writing extensive Terraform code, and interviewing users about their job requirements. We implemented appropriate access controls for hundreds of employees and conducted a hypercare period to quickly resolve any issues, ensuring minimal work disruption. The goal was to align user permissions with actual needs, enhancing security while maintaining operational efficiency."
  },
  {
    title: "Inventory PowerBI Dashboard for Supplychain",
    year: "2022",
    githubUrl: "https://github.com/shreyashguptas/Inventory-PowerBI-Dashboard-for-Supplychain",
    tags: ["PowerBI", "AtScale"],
    date: new Date('2022-01-10'),
    details: "This project involved creating a comprehensive PowerBI dashboard for inventory management for pallets that come into warehouses and distribution centers at Tyson Foods. The dashboard provides real-time insights into stock levels, the pallets weights and other critical decision making enabling better decision-making and optimized inventory control."
  }
]

