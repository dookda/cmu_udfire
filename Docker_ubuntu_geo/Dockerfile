# Use the official Ubuntu 22.04 LTS image as base
FROM ubuntu:22.04

# Metadata
LABEL maintainer="sakda.homhuan@gmail.com"
LABEL version="1.0"
LABEL description="Docker image with GDAL on Ubuntu 22.04"

# Set environment variables to avoid any prompts from APT during build
ENV DEBIAN_FRONTEND=noninteractive

# Install GDAL
RUN apt-get update && apt-get install -y \
    gdal-bin \
    python3-gdal \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Default command: output the version of GDAL
# CMD ["gdalinfo", "--version"]

RUN apt update && apt-get install wget -y
RUN apt update && apt install curl -y
RUN apt update && apt install -y python3-pip
# Install pip reqs
RUN pip install flask
RUN pip install numpy 
RUN pip install -U flask-cors
RUN pip install rasterio
RUN pip install psycopg2-binary
RUN pip install rasterstats
RUN pip install requests
RUN pip install pymodis
RUN pip install slugify
RUN pip install schedule