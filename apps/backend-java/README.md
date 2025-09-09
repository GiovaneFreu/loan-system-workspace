nao# 🚀 Backend Java Development Guide

## Overview

This is a Jakarta EE 11 backend application built with:
- **Framework**: Jakarta EE 11
- **ORM**: Hibernate 6.x with JPA
- **Build Tool**: Gradle (IntelliJ + CLI support)
- **Server**: WildFly Application Server
- **Database**: PostgreSQL
- **Architecture**: JAX-RS REST APIs with CDI

---

## 📋 OPTION 1: IntelliJ IDEA (Recommended for Daily Development)

### ✅ Advantages
- Hot reload & debugging
- Integrated WildFly server
- Visual database tools
- Advanced code completion

### Setup Steps
1. **Import Project**: Open IntelliJ → Import Project → `apps/backend-java`
2. **Configure WildFly**: Add WildFly server in Application Servers
3. **Create Run Configuration**: WildFly → Add Deployment
4. **Run/Debug**: Start your application

### 🌐 API Endpoints
- Base URL: `http://localhost:8080/api/`
- Clients: `GET/POST http://localhost:8080/api/clients`
- Loans: `GET/POST http://localhost:8080/api/loans`

---

## 🖥️ OPTION 2: CLI (Great for CI/CD & Scripting)

### ✅ Advantages
- Automated builds
- Script integration
- No IDE dependency
- CI/CD friendly

### Commands
```bash
# Build WAR file
./gradlew war

# Run tests
./gradlew test

# Clean build
./gradlew clean war

# Via Nx workspace
npx nx build backend-java
```

### 📂 Build Output
- **Location**: `../../dist/apps/backend-java/backend-java-1.0.0.war`
- **Deploy**: Copy WAR to WildFly deployments folder

---

## 🔄 When to Use Each Approach

| Scenario | Recommended Tool | Why |
|----------|------------------|-----|
| **Daily Development** | IntelliJ IDEA | Hot reload, debugging, database tools |
| **Database Work** | IntelliJ IDEA | Visual query builder and database explorer |
| **CI/CD Pipelines** | CLI | Automated, script-friendly, no GUI |
| **Production Builds** | CLI | Consistent, reproducible builds |
| **Quick Testing** | IntelliJ IDEA | Integrated testing and debugging |

---

## 💡 Quick Help Commands

```bash
# Build WAR file
npx nx build backend-java

# Run tests
npx nx test backend-java

# Clean and build
npx nx clean backend-java
```

---

## 📁 Project Structure

```
apps/backend-java/
├── build.gradle              # Build configuration
├── gradlew                   # Gradle wrapper
├── src/
│   ├── main/
│   │   ├── java/com/loanmanager/
│   │   │   ├── entity/       # JPA Entities
│   │   │   ├── repository/   # Data Access Layer
│   │   │   ├── service/      # Business Logic
│   │   │   ├── controller/   # JAX-RS Controllers
│   │   │   └── config/       # Configuration Classes
│   │   ├── resources/
│   │   │   └── META-INF/
│   │   │       └── persistence.xml
│   │   └── webapp/WEB-INF/
│   │       └── web.xml
│   └── test/                 # Unit Tests
└── README.md                # This file
```

---

## 🚀 Getting Started

### Quick Start with IntelliJ
1. **Import**: `File → Open → apps/backend-java`
2. **Configure**: Add WildFly server
3. **Run**: Deploy and start

### Quick Start with CLI
```bash
cd apps/backend-java
./gradlew war
# Deploy generated WAR to WildFly
```

---

## 📚 Additional Resources

- [Jakarta EE 11 Documentation](https://jakarta.ee/specifications/)
- [WildFly Documentation](https://docs.wildfly.org/)
- [Hibernate Documentation](https://hibernate.org/orm/documentation/)
- [JAX-RS Documentation](https://eclipse-ee4j.github.io/jersey/)
