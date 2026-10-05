#!/bin/bash
# manage-dgpci.sh — Start / stop / status / logs for the DGPCI demo stack

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CMD="${1:-status}"

case "${CMD}" in
  start)
    # No -d flag: run in foreground so that a failed startup does not leave the
    # session hung waiting on a detach that never returns.
    # Use Ctrl-C to interrupt; or run in a tmux/screen session for persistence.
    podman-compose --env-file "${SCRIPT_DIR}/.env" -f "${SCRIPT_DIR}/podman-compose.yml" up
    ;;
  stop)
    podman-compose --env-file "${SCRIPT_DIR}/.env" -f "${SCRIPT_DIR}/podman-compose.yml" down
    ;;
  restart)
    podman-compose --env-file "${SCRIPT_DIR}/.env" -f "${SCRIPT_DIR}/podman-compose.yml" down
    podman-compose --env-file "${SCRIPT_DIR}/.env" -f "${SCRIPT_DIR}/podman-compose.yml" up
    ;;
  status)
    echo "=== DGPCI Demo Stack Status ==="
    for svc in postgres ollama-service opensearch-service extract-service translate-service rag-backend dgpci-carbon-ui; do
        STATUS=$(podman inspect --format '{{.State.Status}}' "${svc}" 2>/dev/null || echo "not found")
        HEALTH=$(podman inspect --format '{{.State.Health.Status}}' "${svc}" 2>/dev/null || echo "n/a")
        printf "  %-28s %s  (health: %s)\n" "${svc}" "${STATUS}" "${HEALTH}"
    done
    echo ""
    echo "=== Ports ==="
    echo "  Carbon UI:          http://$(hostname -f):3000"
    echo "  Extract API:        http://$(hostname -f):6000/docs"
    echo "  Translate API:      http://$(hostname -f):9000/docs"
    echo "  RAG Backend:        http://$(hostname -f):8081"
    echo "  OpenSearch:         http://$(hostname -f):9200"
    echo "  Ollama:             http://$(hostname -f):11434"
    ;;
  logs)
    SVC="${2:-dgpci-carbon-ui}"
    podman logs -f "${SVC}"
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs [service]}"
    exit 1
    ;;
esac

# Made with Bob
