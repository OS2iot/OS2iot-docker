FROM ubuntu

RUN apt-get update && apt-get install make

RUN apt-get update && apt-get install git -y

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install golang -y

RUN apt-get install ca-certificates -y

RUN git clone --branch v1.0.2 https://github.com/UniCT-ARSLab/LWN-Simulator.git

WORKDIR /LWN-Simulator

RUN make install-dep

CMD make run