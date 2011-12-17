<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Skyrimage: make an image EPIC</title>
		<style><?php include '../tpl/skyrimage.css'; ?></style>
	</head>
	<body>
		<h1>Skyrimage: Skyrim meme generator</h1>
		<div id="nav">
			<ul>
				<li><a href="/share/" id="nav-share">share this</a></li>
				<li><a href="/create/" id="nav-create">create your own</a></li>
				<li><a href="/random/" id="nav-random">show a random skyrimage</a></li>
			</ul>
		</div>

		<div id="share-modal">
			<div>
				<h2>Share</h2>

				<p>
					<label>URL</label>
					<a href="#" id="share-url">http://skyrimage.com/</a>
				</p>

				<button id="share-tweet">Tweet</button>
				<button id="share-close">Close</button>
			</div>
		</div>

		<div id="create-modal">
			<div>
				<button id="create-save">Save</button>
				<button id="create-cancel">Cancel</button>
			</div>
		</div>
		<div id="inputs" class="hidden">
			<input id="input-image" maxlength="255" placeholder="image URL" type="text">
			<textarea id="input-text" maxlength="255" placeholder="Your epic text here"></textarea>
		</div>
		<div id="error"></div>

		<!--
		<div id="google-ad">
			<?php //include '../tpl/google_ad.html'; ?>
			<div><button id="google-hide">Hide</button></div>
		</div>
		-->

		<div id="text"></div>
		<script src="js/skyrimage.js"></script>
		<script>
			<?php include '../skyrimage.php'; ?>
			var getRandom = true;
			if (location.hash) {
				var id = parseInt(location.hash.replace(/#/, ''));
				if (id) {
					getRandom = false;
					skyrimage.setById(id);
				}
			}
			if (getRandom) {
				<?php $row = (object) $skyrimage->getRandomRow(); ?>
				skyrimage.set(<?php echo json_encode($row); ?>);
			}
		</script>

		<?php include '../tpl/google_analytics.html'; ?>
	</body>
</html>
