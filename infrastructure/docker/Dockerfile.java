# Multi-stage build for Java backend

# Build stage
FROM gradle:8.11.1-jdk21-alpine AS builder

WORKDIR /app

# Copy Gradle files
COPY apps/backend-java/build.gradle .
COPY apps/backend-java/project.json .

# Copy source code
COPY apps/backend-java/src ./src

# Build the application
RUN gradle build --no-daemon

# Runtime stage
FROM openjdk:24-jdk-slim

WORKDIR /app

# Install required packages
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Copy built war file
COPY --from=builder /app/build/libs/*.war /app/app.war

# Create non-root user
RUN useradd -r -s /bin/false appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 3001

# Run the application
CMD ["java", "-jar", "/app/app.war"]