<?php

include 'db_password.php';

class Skyrimage {

	private $pdo;

	public function __construct () {
		$hostname = 'localhost';
		$username = 'skyrimage';
		$password = DB_PASSWORD;

		$this->pdo = new PDO("mysql:host=$hostname;dbname=skyrimage", $username, $password);
	}

	public function getRandomRows ($limit = 25) {
		$statement = $this->pdo->prepare(
			'SELECT * FROM skyrimages ORDER BY RAND() LIMIT :limit'
		);
		$statement->bindParam(':limit', $limit, PDO::PARAM_INT);
		$statement->execute();

		return $statement->fetchAll(PDO::FETCH_ASSOC);
	}

	public function getRandomRow () {
		$rows = $this->getRandomRows(1);

		return $rows[0];
	}

	public function getRowById ($id) {
		$statement = $this->pdo->prepare(
			'SELECT * FROM skyrimages WHERE id = :id'
		);
		$statement->bindParam(':id', $id, PDO::PARAM_INT);
		$statement->execute();

		return $statement->fetch(PDO::FETCH_ASSOC);
	}

	public function getRows ($start = 0, $limit = 25) {
		$statement = $this->pdo->prepare(
			'SELECT * FROM skyrimages ORDER BY time_added DESC'
		);
		$statement->execute();

		return $statement->fetchAll(PDO::FETCH_ASSOC);
	}

	public function insertRow ($src, $text) {
		$statement = $this->pdo->prepare(
			'INSERT INTO skyrimages (ip_address, src, text) VALUES (:ip_address, :src, :text)'
		);
		$statement->bindParam(':ip_address', getenv('REMOTE_ADDR'), PDO::PARAM_STR);
		$statement->bindParam(':src', $src, PDO::PARAM_STR);
		$statement->bindParam(':text', $text, PDO::PARAM_STR);
		$result = $statement->execute();

		if ($result) {
			return $this->getRowById($this->pdo->lastInsertId());
		}
		return false;
	}

}

$skyrimage = new Skyrimage();
