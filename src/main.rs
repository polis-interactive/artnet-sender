// Prevent console window in addition to Slint window in Windows release builds when, e.g., starting the app via file manager. Ignored on other platforms.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{error::Error, rc::Rc, time::Duration};
use slint::{ComponentHandle, Timer};

slint::include_modules!();

mod network;
use network::get_network_interfaces;

fn main() -> Result<(), Box<dyn Error>> {
  let app = ArtnetSender::new().unwrap();

  /* setup network interface callback */
  let app_handle = app.as_weak();

  // alot of this could be avoided by simply using the slint types...
  let get_iface_callback = move || {
    let ifaces = get_network_interfaces();
    let app = app_handle.unwrap();
    let app_store = app.global::<Store>();
    app_store.set_has_searched_interfaces(true);
    app_store.set_network_interfaces(Rc::new(ifaces).into());
  };
  
  get_iface_callback();
  let timer = Timer::default();
  timer.start(slint::TimerMode::Repeated, Duration::from_secs(5), get_iface_callback);

  app.run()?;

  Ok(())
}
