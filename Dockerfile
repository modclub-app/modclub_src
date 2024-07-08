FROM ghcr.io/dfinity/icp-dev-env:latest
LABEL maintainer="DecideAI"

COPY . .

ENV DFX_VERSION=0.20.1
ENV HOME /root

RUN corepack enable
RUN yarn install

RUN dfxvm install ${DFX_VERSION}

#RUN mkdir -p $HOME/.config/dfx/identity/default/
#RUN echo "k2n4s-jhqtt-naez5-aa4el-r5dap-2npqk-s53zq-jj4ij-6cs66-mshkg-kae" > $HOME/.config/dfx/identity/default/identity.pem
#RUN dfx identity get-principal

RUN curl -fsSL cli.mops.one/install.sh | bash

ENTRYPOINT ["/bin/sh", "-c", "dfx start --clean"]
