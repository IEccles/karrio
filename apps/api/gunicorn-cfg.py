# -*- encoding: utf-8 -*-
import decouple

KARRIO_HOST = decouple.config("KARRIO_HTTP_HOST", default="karrio.invente.co.uk")
KARRIO_PORT = decouple.config("KARRIO_HTTP_PORT", default=4003)

bind = f"{KARRIO_HOST}:{KARRIO_PORT}"
accesslog = "-"
loglevel = "debug"
capture_output = True
enable_stdio_inheritance = True
workers = decouple.config("KARRIO_WORKERS", default=2, cast=int)
