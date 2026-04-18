# CrowdSync Lite – Smart Stadium Assistant
##🚀 AI-powered real-time smart navigation assistant for stadium crowd optimization

## Chosen Vertical
Smart Event & Stadium Management System

## Problem Statement
Managing large crowds in stadiums often leads to congestion, long queues, and poor user experience. Visitors lack real-time visibility and intelligent guidance to navigate efficiently.

## Solution
CrowdSync is a real-time smart assistant designed to monitor crowd density and provide intelligent recommendations for movement, entry, and facility usage inside large event venues.

## Key Features
- Real-time crowd monitoring using Firebase Firestore
- AI-powered Smart Route Recommendation system
- Intelligent gate and zone suggestions
- Facilities insights (toilets, food, parking)
- Transport availability tracking
- Dynamic UI updates with live data

## How It Works
- Firebase Firestore provides real-time updates for zones, gates, and facilities
- The system continuously calculates crowd density percentages
- Based on real-time data, it identifies congested and less crowded areas
- It generates smart recommendations for optimal entry gates and movement paths
- Users receive actionable insights to avoid congestion and improve experience

## Google Services Used
- Firebase Firestore (real-time database)
- Google Cloud Run (deployment and hosting)

## Assumptions
- Crowd data is updated in real-time
- Each user is assigned a zone dynamically
- Gate-to-zone mapping is predefined
- Facilities data reflects live usage

## Improvements Made
- Added AI-powered smart route recommendation system
- Improved security using environment variables (.env)
- Added basic testing for functionality validation
- Enhanced accessibility using semantic HTML and ARIA labels
- Optimized Firebase usage for better performance and efficiency

## Repository Details
- Public GitHub repository
- Single branch implementation
- Lightweight codebase (<1 MB)

## Conclusion
CrowdSync transforms traditional crowd monitoring into an intelligent decision-making system, helping users navigate large venues efficiently while reducing congestion and improving overall event experience.
