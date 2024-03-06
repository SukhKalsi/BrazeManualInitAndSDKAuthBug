//
//  BrazeManager.swift
//  BrazeManualInitialisation
//
//  Created by Sukh on 05/03/2024.
//

import Foundation
import BrazeKit
import braze_react_native_sdk

@objc(BrazeManager)
class BrazeManager: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc(initialiseSDK:withBrazeToken:resolver:rejecter:)
  func initialiseSDK(_ userId: String, withBrazeToken brazeToken: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    /// TODO: Replace this with your Braze environment
   let config = Braze.Configuration(apiKey: "apiKey", endpoint: "endpoint")
    config.logger.level = .debug
    config.triggerMinimumTimeInterval = 1
    config.devicePropertyAllowList = [.osVersion]
    guard let brazeInstance = BrazeReactBridge.perform(#selector(BrazeReactBridge.initBraze(_:)),with: config).takeUnretainedValue() as? Braze else {
      reject("error", "Failed to initialise Braze", nil)
      return
    }
    brazeInstance.changeUser(userId: userId, sdkAuthSignature: brazeToken)
    BrazeSession.braze = brazeInstance
    resolve(true)
  }
}
