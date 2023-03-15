use dotenv::dotenv;
use tokio_postgres::NoTls;

type Error = Box<dyn std::error::Error + Send + Sync + 'static>;

mod embedded {
    use refinery::embed_migrations;

    embed_migrations!("migrations");
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    dotenv().ok();

    let config = std::env::var("POSTGRES_CONFIG");
    let config_string = match config {
        Ok(config_string) => config_string,
        Err(_) => {
            println!("POSTGRES_CONFIG environment variable must be defined");
            return Ok(())
        },
    };

    let (mut client, connection) = tokio_postgres::connect(config_string.as_str(), NoTls).await?;

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    let migration_report = embedded::migrations::runner().run_async(&mut client).await?;

    for migration in migration_report.applied_migrations() {
        println!(
            "Migration Applied -  Name: {}, Version: {}",
            migration.name(),
            migration.version()
        );
    }

    println!("DB migrations finished!");

    Ok(())
}
