#!/bin/sh

# Initialize OpenClaw config from environment variable
if [ -n "$OPENCLAW_INITIAL_CONFIG" ]; then
  mkdir -p $OPENCLAW_CONFIG_DIR
  echo "$OPENCLAW_INITIAL_CONFIG" > $OPENCLAW_CONFIG_DIR/openclaw.json
  echo "Initialized config from OPENCLAW_INITIAL_CONFIG"
fi

# Initialize gog credentials from environment variable
if [ -n "$GOG_CREDENTIALS_JSON" ]; then
  GOG_CREDENTIALS_DIR="${HOME}/.config/gogcli"
  mkdir -p "$GOG_CREDENTIALS_DIR"
  echo "$GOG_CREDENTIALS_JSON" > "$GOG_CREDENTIALS_DIR/credentials.json"
  echo "Initialized gog credentials from GOG_CREDENTIALS_JSON"

  # Authenticate with gog using the credentials file
  if gog auth credentials "${GOG_CREDENTIALS_DIR}/credentials.json"; then
    echo "Successfully authenticated with gog"
  else
    echo "Warning: gog auth credentials failed (exit code $?), continuing anyway..."
  fi
fi

exec "$@"
