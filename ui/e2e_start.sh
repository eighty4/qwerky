#!/bin/bash

running=true

pushd ../qwerky
  pnpm build
  pnpm start &
  qwerky_start_pid=$!
popd

pnpm build
pnpm preview &
ui_preview_pid=$!

function cleanup()
{
  kill -9 $qwerky_start_pid
  kill -9 $ui_preview_pid
  running=false
}

trap cleanup EXIT

while [ $running = true ]; do sleep 1; done;
