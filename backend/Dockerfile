FROM public.ecr.aws/lambda/python:3.12

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirement.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --no-cache-dir -r requirement.txt

COPY main.py ${LAMBDA_TASK_ROOT}/
COPY src ${LAMBDA_TASK_ROOT}/src

CMD ["main.handler"]
