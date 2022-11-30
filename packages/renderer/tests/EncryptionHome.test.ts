import {mount} from '@vue/test-utils';
import {describe, expect, test, vi} from 'vitest';
import EncryptionHome from '../src/components/EncryptionHome.vue';
import type {IpcRendererEvent} from 'electron';

vi.mock('#preload', () => {
  return {
    versions: {lib1: 1, lib2: 2},
    invokeEncrypt: (
      input: string,
      output: string,
      callback: (event: IpcRendererEvent, message: string) => void,
    ) => {
      callback('1', '成功');
    },
  };
});

describe('test message', () => {
  test('test message', async () => {
    expect(EncryptionHome).toBeTruthy();
    const wrapper = mount(EncryptionHome, {
      data() {
        return {
          inputPath: '1',
          outputPath: '2',
        };
      },
    });

    const btn = wrapper.find<HTMLButtonElement>('[data-test="startBtn"]');
    btn.trigger('click');
    const msg = wrapper.find<HTMLElement>('[data-test="msg"]');
    setTimeout(() => {
      expect(msg.text()).toBe('成功');
    }, 1000);
  });
  test('test validation', async () => {
    expect(EncryptionHome).toBeTruthy();
    const wrapper = mount(EncryptionHome, {
      data() {
        return {
          inputPath: '',
          outputPath: '2',
        };
      },
    });

    const btn = wrapper.find<HTMLButtonElement>('[data-test="startBtn"]');
    btn.trigger('click');
    const msg = wrapper.find<HTMLElement>('[data-test="msg"]');
    setTimeout(() => {
      expect(msg.text()).toBe('路径不能为空');
    }, 1000);
  });


});
