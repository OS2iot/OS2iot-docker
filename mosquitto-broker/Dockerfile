# Build stage
FROM ubuntu:22.04 AS builder

ARG MOSQUITTO_VERSION=2.0.15
ARG GO_AUTH_VERSION=2.1.0

# Install build dependencies in single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    g++ \
    gcc \
    git \
    golang-go \
    libcjson-dev \
    libc-ares-dev \
    libssl-dev \
    libwebsockets-dev \
    make \
    mosquitto-dev \
    libmosquitto-dev \
    openssl \
    uuid-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Build Mosquitto with WebSocket support
WORKDIR /build
RUN wget -q https://mosquitto.org/files/source/mosquitto-${MOSQUITTO_VERSION}.tar.gz \
    && tar xzf mosquitto-${MOSQUITTO_VERSION}.tar.gz \
    && cd mosquitto-${MOSQUITTO_VERSION} \
    && sed -i 's/WITH_WEBSOCKETS:=no/WITH_WEBSOCKETS:=yes/g' config.mk \
    && make \
    && make install DESTDIR=/build/mosquitto-install

# Build mosquitto-go-auth plugin
WORKDIR /build
RUN git clone --depth 1 --branch ${GO_AUTH_VERSION} https://github.com/iegomez/mosquitto-go-auth.git \
    && cd mosquitto-go-auth \
    && make

# Runtime stage
FROM ubuntu:22.04

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libc-ares2 \
    libcjson1 \
    libssl3 \
    libwebsockets16 \
    && rm -rf /var/lib/apt/lists/*

# Copy Mosquitto from builder
COPY --from=builder /build/mosquitto-install/usr/local/ /usr/local/

# Copy go-auth plugin to expected location
COPY --from=builder /build/mosquitto-go-auth/go-auth.so /home/mosquitto-go-auth/go-auth.so

# Update library cache
RUN ldconfig

# Create mosquitto user and directories
RUN groupadd -r mosquitto \
    && useradd -r -s /sbin/nologin -g mosquitto -d /var/lib/mosquitto mosquitto \
    && mkdir -p /var/log/mosquitto /var/lib/mosquitto /etc/mosquitto/conf.d \
    && chown -R mosquitto:mosquitto /var/log/mosquitto /var/lib/mosquitto

EXPOSE 1883 8883 8884 8885 9001

USER mosquitto

CMD ["mosquitto", "-c", "/etc/mosquitto/conf.d/go-auth.conf"]
