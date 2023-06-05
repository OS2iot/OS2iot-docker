FROM ubuntu

RUN apt-get update && apt-get install libwebsockets-dev libc-ares2 libc-ares-dev openssl uuid uuid-dev gcc libssl-dev g++ golang-go wget git make -y

RUN cd /home

RUN wget http://mosquitto.org/files/source/mosquitto-2.0.15.tar.gz

RUN tar xzvf mosquitto-2.0.15.tar.gz

WORKDIR mosquitto-2.0.15

RUN sed -i 's/WITH_WEBSOCKETS:=no/WITH_WEBSOCKETS:=yes/g' config.mk

RUN apt install libcjson1 libcjson-dev

RUN make

RUN make install

RUN groupadd mosquitto

RUN useradd -s /sbin/nologin mosquitto -g mosquitto -d /var/lib/mosquitto

RUN mkdir -p /var/log/mosquitto/ /var/lib/mosquitto/

RUN chown -R mosquitto:mosquitto /var/log/mosquitto/

RUN chown -R mosquitto:mosquitto /var/lib/mosquitto/

WORKDIR /etc/systemd/system

RUN touch mosquitto.service

RUN echo "[Unit] \n\
Description=Mosquitto MQTT v3.1/v5 server \n\
Wants=network.target \n\
Documentation=http://mosquitto.org/documentation/ \n\
\n\
[Service] \n\
Type=simple \n\
User=mosquitto \n\
Group=mosquitto \n\
ExecStart=/usr/local/sbin/mosquitto -c /etc/mosquitto/mosquitto.conf \n\
Restart=on-failure \n\
SyslogIdentifier=Mosquitto \n\
\n\
[Install] \n\
WantedBy=multi-user.target " >> /etc/systemd/system/mosquitto.service

WORKDIR /usr/local/include

RUN apt install mosquitto-dev libmosquitto-dev -y

WORKDIR /home/

RUN git clone https://github.com/iegomez/mosquitto-go-auth.git

WORKDIR /home/mosquitto-go-auth

RUN make

WORKDIR /etc/mosquitto/conf.d

RUN touch go-auth.conf

CMD mosquitto -c /etc/mosquitto/conf.d/go-auth.conf 



