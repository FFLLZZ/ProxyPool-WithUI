FROM python:3.11-slim

WORKDIR /proxy

COPY requirements.txt .
RUN pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/ \
 && pip install -U pip --no-cache-dir \
 && pip install --no-cache-dir -r requirements.txt

# 复制所有文件（包括 setup_security.py）
COPY . .

# 执行安全配置（重要！）
RUN python setup_security.py

EXPOSE 5000
CMD ["python", "main.py"]