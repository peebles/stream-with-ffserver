# Stream with FFserver

Create a docker container that watches a directory ( probably from a --volumes-from ) and
re-creates a ffserver config file when changes are made to that directory, and restarts
ffserver.

## Example

    npm install
    docker build -t streamer
    docker run -d --name streamer \
        --volumes-from uploader \
	-p 554:554 \
	-e WATCH_DIR=/deploy/server/public/files \
	streamer

## Configuration

You have some control over how the ffserver config file will look like.  In `config.json` there
is a `header` array that will be used to create the header, and `additional_stream_directives`
which will be added to each `<Stream></Stream>` block.  As an example, if `WATCH_DIR` was set to `/tmp/test`
and contained the single file `test.mp4`, then the ffserver config file would look like the following:

    HTTPPort 8090
    HTTPBindAddress 0.0.0.0
    RTSPPort 554
    MaxClients 1000
    MaxBandwidth 1000
    
    <Stream test>
    Format rtp
    File "/tmp/test/test.mp4"
    PreRoll 5
    NoLoop
    </Stream>

and the streaming url for a client would be:

    rtsp://<server>/test

