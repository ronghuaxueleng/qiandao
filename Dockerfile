# 基础镜像
FROM a76yyyy/pycurl:latest

# 维护者信息
LABEL maintainer "a76yyyy <q981331502@163.com>"
LABEL org.opencontainers.image.source=https://github.com/qiandao-today/qiandao

ADD ssh/qiandao_fetch /root/.ssh/id_rsa
ADD ssh/qiandao_fetch.pub /root/.ssh/id_rsa.pub
WORKDIR /usr/src/app

# Qiandao && Pip install modules
RUN apk add --update --no-cache openssh-client && \
    chmod 600 /root/.ssh/id_rsa && \
    ssh-keyscan gitee.com > /root/.ssh/known_hosts && \
    let num=$RANDOM%100+10 && \
    sleep $num && \
    git clone --depth 1 git@gitee.com:a76yyyy/qiandao.git /gitclone_tmp && \
    yes | cp -rf /gitclone_tmp/. /usr/src/app && \
    rm -rf /gitclone_tmp && \
    chmod +x /usr/src/app/update.sh && \
    ln -s /usr/src/app/update.sh /bin/update && \
    apk add --update --no-cache openssh-client python3 py3-six \
    py3-markupsafe py3-pycryptodome py3-tornado py3-wrapt \
    py3-packaging py3-greenlet py3-urllib3 py3-cryptography && \
    [[ $(getconf LONG_BIT) = "32" ]] && \
    echo "Tips: 32-bit systems do not support ddddocr, so there is no need to install numpy and opencv-python" || \
    apk add --update --no-cache py3-numpy-dev py3-opencv py3-pillow && \
    apk add --no-cache --virtual .build_deps cmake make perl \
    autoconf g++ automake py3-pip py3-setuptools py3-wheel python3-dev \
        linux-headers libtool util-linux && \
    sed -i '/ddddocr/d' requirements.txt && \
    sed -i '/packaging/d' requirements.txt && \
    sed -i '/wrapt/d' requirements.txt && \
    sed -i '/pycryptodome/d' requirements.txt && \
    sed -i '/tornado/d' requirements.txt && \
    sed -i '/MarkupSafe/d' requirements.txt && \
    sed -i '/pillow/d' requirements.txt && \
    sed -i '/opencv/d' requirements.txt && \
    sed -i '/numpy/d' requirements.txt && \
    sed -i '/greenlet/d' requirements.txt && \
    sed -i '/urllib3/d' requirements.txt && \
    sed -i '/cryptography/d' requirements.txt && \
    pip install --no-cache-dir -r requirements.txt && \
    apk del .build_deps && \
    rm -rf /var/cache/apk/* && \
    rm -rf /usr/share/man/* 

ENV PORT 80
EXPOSE $PORT/tcp

# timezone
ENV TZ=CST-8

# 添加挂载点
VOLUME ["/usr/src/app/config"]

CMD ["sh","-c","python /usr/src/app/run.py"]