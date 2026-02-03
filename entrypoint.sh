#!/bin/sh
if [ -n "$OPENCLAW_INITIAL_CONFIG" ]; then
  mkdir -p $OPENCLAW_CONFIG_DIR
  echo "$OPENCLAW_INITIAL_CONFIG" > $OPENCLAW_CONFIG_DIR/openclaw.json
  echo "Initialized config from OPENCLAW_INITIAL_CONFIG"
fi
exec "$@"
