use ksn_pg_interface::*;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let migrate_mode = env::var("MIGRATE_MODE").unwrap_or_else(|_| "all".to_string());
    let node_id = env::var("NODE_ID").ok();
    let node_count = env::var("NODE_COUNT")
        .unwrap_or_else(|_| "2".to_string())
        .parse::<u32>()
        .unwrap_or(2);

    // Database connection
    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        let host = env::var("DB_HOST").unwrap_or_else(|_| "localhost".to_string());
        let user = env::var("DB_USER").unwrap_or_else(|_| "postgres".to_string());
        let password = env::var("DB_PASSWORD").unwrap_or_else(|_| "password".to_string());
        let dbname = env::var("DB_NAME").unwrap_or_else(|_| "key_share_node".to_string());
        let port = env::var("DB_PORT").unwrap_or_else(|_| "5432".to_string());

        format!(
            "host={} user={} password={} dbname={} port={}",
            host, user, password, dbname, port
        )
    });

    println!("Migration Mode: {}", migrate_mode);
    if let Some(ref id) = node_id {
        println!("Node ID: {}", id);
    }
    println!("Node Count: {}", node_count);
    println!(
        "Database URL: {}",
        database_url.replace(&env::var("DB_PASSWORD").unwrap_or_default(), "***")
    );

    match migrate_mode.as_str() {
        "all" => {
            println!("\nRunning migration for all nodes...");
            for i in 1..=node_count {
                let db_name = format!("key_share_node_rs_dev_{}", i);
                let connection_string = database_url.replace("key_share_node", &db_name);

                println!("\nMigrating node {} database: {}", i, db_name);
                run_single_migration(&connection_string, i).await?;
            }
            println!("\nAll node migrations completed successfully!");
        }
        "one" => {
            let node_id = node_id
                .ok_or("NODE_ID must be set when MIGRATE_MODE=one")?
                .parse::<u32>()?;

            let db_name = format!("key_share_node_rust{}", node_id);
            let connection_string = database_url.replace("key_share_node", &db_name);

            println!("\nMigrating single node {} database: {}", node_id, db_name);
            run_single_migration(&connection_string, node_id).await?;
            println!("\nNode {} migration completed successfully!", node_id);
        }
        _ => {
            eprintln!("Invalid MIGRATE_MODE: {}. Use 'all' or 'one'", migrate_mode);
            std::process::exit(1);
        }
    }

    Ok(())
}

async fn run_single_migration(
    connection_string: &str,
    node_id: u32,
) -> Result<(), Box<dyn std::error::Error>> {
    println!("  Connecting to database...");
    let client = connect_to_postgres(connection_string)
        .await
        .map_err(|e| format!("Failed to connect to database for node {}: {}", node_id, e))?;

    println!("  Dropping existing tables...");
    drop_all_tables_if_exist(&client)
        .await
        .map_err(|e| format!("Failed to drop tables for node {}: {}", node_id, e))?;

    println!("  Running migration script...");
    run_migration(&client)
        .await
        .map_err(|e| format!("Failed to run migration for node {}: {}", node_id, e))?;

    println!("  Node {} migration completed", node_id);
    Ok(())
}
