//
//  BrazeSession.swift
//  BrazeManualInitialisation
//
//  Created by Sukh on 05/03/2024.
//

import Foundation
import BrazeKit

@objc(BrazeSession)
class BrazeSession: NSObject {
  private static let shared = BrazeSession()
  static var braze: Braze? = nil
  @objc class func sharedInstance() -> BrazeSession {
    return BrazeSession.shared
  }
}
