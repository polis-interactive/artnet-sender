
use netdev::interface::InterfaceType;
use slint::VecModel;

use crate::NetworkInterface;

pub fn get_network_interfaces() -> VecModel<NetworkInterface> {
  let ifaces = netdev::get_interfaces();
  ifaces.iter().fold(
    VecModel::default(),
    |out, iface | {
    let is_ipv4 = iface.ipv4.len() == 1;
    // probs more conditions but meh
    let is_internal = iface.is_loopback() || iface.if_type == InterfaceType::ProprietaryVirtual;
    if is_ipv4 && !is_internal {
      let name = if let Some(f_name) = iface.friendly_name.clone() {
        f_name
      } else {
        iface.name.clone()
      };
      let ipv4 = &iface.ipv4[0];
      out.push(NetworkInterface {
        name: name.into(),
        address: ipv4.to_string().into(),
        netmask: ipv4.netmask().to_string().into(),
      });
    }
    out
  })
}

#[cfg(test)]
mod tests {
  use slint::Model;

use super::*;

  #[test]
  fn test_get_network_interfaces() {
    let ifaces = get_network_interfaces();
    // run with cargo test -- --nocapture; very vibes based
    for iface in ifaces.iter() {
      println!("Interface:");
      println!("\tName: {}", iface.name);
      println!("\tAddress: {}", iface.address);
      println!("\tNetmask: {}", iface.netmask);
    }
  }
}