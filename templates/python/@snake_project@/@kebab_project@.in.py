#!/usr/bin/env @PYTHON@
import os
import sys
import signal
import locale
import gettext


VERSION = '@VERSION@'
pkgdatadir = '@pkgdatadir@'
localedir = '@localedir@'
sourceroot = '@sourceroot@'


def start_debugger():
    print("Running in debug mode")
    try:
        import debugpy
    except ImportError:
        print("Unable to locate debugpy package can't start debugger")
        return
    debugpy.connect(5678)
    print("Waiting for debugger connection ...")
    debugpy.wait_for_client()
    print("Debugger connected!")


sys.path.insert(1, pkgdatadir)
signal.signal(signal.SIGINT, signal.SIG_DFL)
locale.bindtextdomain('@kebab_project@', localedir)
locale.textdomain('@kebab_project@')
gettext.install('@kebab_project@', localedir)

if os.environ.get("DEBUG_MODE") == "1":
    start_debugger()

if __name__ == '__main__':
    import gi
    gi.require_version('Gtk', '4.0')

    from gi.repository import Gio
    resource = Gio.Resource.load(os.path.join(
        pkgdatadir, '@kebab_project@.gresource'))
    resource._register()

    from @ snake_project@.backend import main
    sys.exit(main.main(VERSION))
