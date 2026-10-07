# BrightSpark Electricals & Electronics - Frontend

A modern, responsive web application for **BrightSpark Electricals & Electronics**, designed to provide customers with an easy way to browse products while providing employees and administrators with dedicated business management interfaces.
The frontend is built with **Next.js, JavaScript, and Tailwind css** and is designed to intergrate with a separate **Flask REST API backend**.

## Table of Contents
- [Overview](#overview)
- [Business](#business)
- [Technology Stack](#technology-stack)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Branch Structure](#branch-structure)
- [Project Structure](#project-structure)
- [Application Routes](#application-routes)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Building for Production](#bulding-for-production)
- [Backend Integration](#backend-integration)
- [Design System](#design-system)
- [Development Guidelines](#development-guidelines)
- [Security Considerations](#security-considerations)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)

---

# Overview

**BrightSpark Electricals & Electronics** is a business management and e-commerce platform developed for the sale and management of:
- Electrical appliances
- Electronic appliances
- Phone accessories
- Electrical accessories
- Other related products

The application provides separate experiences for:

### Customers
Customers can:
- Browse available products
- Search for products
- View product details
- Check product availability
- Navigate between different sections of the website
- Contact BrightSpark
- Place orders as the e-commerce functionality is intergrated

### Employees
Employees can:
- Access their employee dashboard
- View products and stock
- Record sales
- Record business expenses
- Add stock
- View branch-specific information

### Administrators
Administrators can manage the overall business operation, including:
- Users
- Employees
- Products
- Inventory
- Sales
- Expenses
- Financial reports
- Branch operations

---

# Business

## BrightSpark Electricals & Electronics
BrightSpark operates through multiple physical branches.

### Roysambu Branch
**Location:** Lumumba Drive
This is the main BrightSpark shop.

### Rangau Branch
**Location:** Rangau Shopping Center
The Rangau branch operates independently from the Roysambu branch.
The system is designed so that inventory, sales, expenses, and other operational information can be associated with the correct branch.

---

# Technology Stack
The frontend uses the following technologies:

| Technology | Purpose |
|------------|---------|
| Next.js | React-based frontend framework |
| JavaScript | Application programming language |
| JSX | UI component development |
| Tailwind CSS | Styling and responsive design |
| React | User interface development |
| Lucide React | UI icons |
| Next.js App Router | Application routing |
| JWT | Authentication intergration with backend |
| REST API | Communication with Flask backend |

---

# Key Features