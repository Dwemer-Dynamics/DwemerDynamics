// Kosmokrator screenshot gallery: turns the thumbnail links into buttons that change the large preview.
// Without JavaScript the thumbnails stay plain links to each full-size screenshot.
(function () {
    var gallery = document.querySelector(".kosmokrator-gallery");
    if (!gallery) return;

    var previewLink = gallery.querySelector(".kosmokrator-gallery-preview a");
    var previewImage = previewLink.querySelector("img");
    var caption = gallery.querySelector(".kosmokrator-gallery-preview figcaption");
    var buttons = [];

    function select(button) {
        previewLink.href = button.dataset.src;
        previewImage.src = button.dataset.src;
        previewImage.alt = button.dataset.alt;

        var title = document.createElement("b");
        title.textContent = button.dataset.title;
        caption.replaceChildren(title, " " + button.dataset.caption);

        buttons.forEach(function (other) {
            other.setAttribute("aria-pressed", other === button ? "true" : "false");
        });
    }

    gallery.querySelectorAll(".kosmokrator-gallery-thumb").forEach(function (link) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = link.className;
        button.dataset.src = link.getAttribute("href");
        button.dataset.title = link.dataset.title;
        button.dataset.caption = link.dataset.caption;
        button.dataset.alt = link.dataset.alt;
        button.setAttribute("aria-pressed", link.getAttribute("href") === previewLink.getAttribute("href") ? "true" : "false");
        button.append.apply(button, Array.prototype.slice.call(link.childNodes));
        button.addEventListener("click", function () {
            select(button);
        });
        link.replaceWith(button);
        buttons.push(button);
    });
})();
