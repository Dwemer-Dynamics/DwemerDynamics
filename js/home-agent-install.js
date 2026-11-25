// Homepage "Install with your agent" dialog (styles in css/home-guidewall.css). The prompt text
// lives in dwemerdistro/agent-install-prompt.txt and is fetched on first open. Native <dialog>
// supplies Escape and the inert background; Tab is kept inside and focus returns to the opener.
(function () {
    var dialog = document.getElementById('agentInstall');
    var opener = document.getElementById('agentInstallOpen');
    if (!dialog || !opener || typeof dialog.showModal !== 'function') return;

    var closeBtn = document.getElementById('agentInstallClose');
    var field = document.getElementById('agentInstallPrompt');
    var copyBtn = document.getElementById('agentInstallCopy');
    var status = document.getElementById('agentInstallStatus');
    var rawWrap = document.getElementById('agentInstallRawWrap');
    var rawLink = document.getElementById('agentInstallRaw');
    var state = 'idle'; // idle | loading | ready | error
    var returnTo = null;

    function setStatus(text, kind) {
        status.textContent = text;
        status.className = 'agent-status' + (kind ? ' is-' + kind : '');
    }

    function load() {
        if (state === 'loading' || state === 'ready') return;
        state = 'loading';
        copyBtn.disabled = true;
        copyBtn.textContent = 'Copy';
        field.value = 'Loading prompt…';
        field.setAttribute('aria-busy', 'true');
        setStatus('Loading the setup prompt…');
        fetch(rawLink.href, { cache: 'no-cache' })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
            })
            .then(function (text) {
                if (!text.trim()) throw new Error('empty');
                state = 'ready';
                field.value = text.replace(/\s+$/, '');
                // Setting the value leaves the caret at the end; start reading from the top.
                field.setSelectionRange(0, 0);
                field.scrollTop = 0;
                copyBtn.disabled = false;
                setStatus('');
            })
            .catch(function () {
                state = 'error';
                field.value = '';
                setStatus("Couldn't load the prompt. Check your connection and try again, or open it as text.", 'error');
                copyBtn.disabled = false;
                copyBtn.textContent = 'Try again';
                rawWrap.hidden = false;
            })
            .then(function () { field.removeAttribute('aria-busy'); });
    }

    function selectField() {
        field.focus();
        field.select();
        field.setSelectionRange(0, field.value.length);
    }

    function legacyCopy() {
        selectField();
        try { return document.execCommand('copy'); } catch (e) { return false; }
    }

    function copied() {
        setStatus('Copied. Paste it into Codex or Claude on your Windows PC.', 'ok');
        copyBtn.focus();
    }

    function notCopied() {
        // Leave the prompt selected so a manual Ctrl+C copies it.
        selectField();
        setStatus("Couldn't copy automatically. The prompt is selected: press Ctrl+C to copy it.", 'error');
    }

    function copy() {
        if (state === 'error') { load(); return; }
        if (state !== 'ready') return;
        var text = field.value;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(copied, function () {
                if (legacyCopy()) copied(); else notCopied();
            });
        } else if (legacyCopy()) {
            copied();
        } else {
            notCopied();
        }
    }

    function focusables() {
        return Array.prototype.filter.call(
            dialog.querySelectorAll('button, a[href], textarea, [tabindex]:not([tabindex="-1"])'),
            function (el) { return !el.disabled && el.offsetParent !== null; }
        );
    }

    opener.addEventListener('click', function () {
        returnTo = document.activeElement;
        document.documentElement.classList.add('agent-dialog-open');
        dialog.showModal();
        closeBtn.focus();
        load();
    });
    closeBtn.addEventListener('click', function () { dialog.close(); });
    copyBtn.addEventListener('click', copy);
    // Click on the backdrop (outside the panel box) closes, like Escape.
    dialog.addEventListener('click', function (e) {
        if (e.target !== dialog) return;
        var r = dialog.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    });
    dialog.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        var items = focusables();
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
            e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
        }
    });
    dialog.addEventListener('close', function () {
        document.documentElement.classList.remove('agent-dialog-open');
        if (state === 'ready') setStatus('');
        (returnTo && document.contains(returnTo) ? returnTo : opener).focus();
    });

    opener.hidden = false;
})();
