#!/bin/bash

vercel link --yes --scope=keplrwallet --project=oko-demo-web
vercel build
vercel deploy --prebuilt
