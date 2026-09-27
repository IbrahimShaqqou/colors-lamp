#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${1:-http://127.0.0.1}
: "${COLORS_TEST_LOGIN:?Set COLORS_TEST_LOGIN before running this script.}"
: "${COLORS_TEST_PASSWORD:?Set COLORS_TEST_PASSWORD before running this script.}"

post() {
  local endpoint=$1
  local body=$2
  curl --fail-with-body --silent --show-error \
    -H 'Content-Type: application/json' \
    --data "$body" \
    "$BASE_URL/LAMPAPI/$endpoint"
}

login_body=$(php -r 'echo json_encode(["login" => getenv("COLORS_TEST_LOGIN"), "password" => getenv("COLORS_TEST_PASSWORD")]);')
login_response=$(post Login.php "$login_body")
echo "$login_response"

user_id=$(LOGIN_RESPONSE="$login_response" php -r '$data = json_decode(getenv("LOGIN_RESPONSE"), true); echo (int) ($data["id"] ?? 0);')
if [[ $user_id -lt 1 ]]; then
  echo 'Login test failed.' >&2
  exit 1
fi

post AddColor.php "{\"userId\":${user_id},\"color\":\"Orange\"}"
echo
post SearchColors.php "{\"userId\":${user_id},\"search\":\"Orange\"}"
echo

