FROM python:3.7.0

WORKDIR /proxy

COPY requirements.txt .
RUN pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/ \
 && pip install -U pip --no-cache-dir \
 && pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 5000
CMD ["python", "main.py"]
