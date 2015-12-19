FROM vimagick/ffserver

RUN apk update && apk add nodejs bash

ADD . /

EXPOSE 554

CMD [ "node", "watcher.js" ]
