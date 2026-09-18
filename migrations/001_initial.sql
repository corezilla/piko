PRAGMA foreign_keys=ON;
PRAGMA journal_mode=WAL;
PRAGMA synchronous=FULL;

-- The executable migration is kept in TaskStore.migrate so a first boot is
-- self-contained. This checked-in marker gives operators a stable schema
-- version and prevents an unreviewed external migration chain.
PRAGMA user_version=1;
